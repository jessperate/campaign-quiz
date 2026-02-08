export interface EnrichedProfile {
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  profileImageUrl: string;
}

const API_BASE = "https://api.phantombuster.com/api/v2";
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_MS = 60000;

function getHeaders(): Record<string, string> {
  return {
    "X-Phantombuster-Key-1": process.env.PHANTOMBUSTER_API_KEY!,
    "Content-Type": "application/json",
  };
}

function normalizeLinkedInUrl(url: string): string {
  return url
    .replace(/\/+$/, "")
    .replace(/^https?:\/\/(www\.)?/, "")
    .toLowerCase();
}

function parseProfile(
  results: Record<string, unknown>[],
  linkedinUrl: string
): EnrichedProfile | null {
  const normalizedInput = normalizeLinkedInUrl(linkedinUrl);
  console.log("[PhantomBuster] Looking for profile matching:", normalizedInput, "in", results.length, "results");

  const profile = results.find((r) => {
    const url = normalizeLinkedInUrl((r.profileUrl as string) || (r.linkedinProfile as string) || "");
    console.log("[PhantomBuster] Comparing:", url, "vs", normalizedInput);
    return url === normalizedInput;
  });

  if (!profile) {
    console.warn("[PhantomBuster] No matching profile found for:", linkedinUrl);
    return null;
  }

  const result = {
    firstName: (profile.firstName as string) || "",
    lastName: (profile.lastName as string) || "",
    company: (profile.companyName as string) || "",
    title: (profile.linkedinJobTitle as string) || (profile.linkedinHeadline as string) || "",
    profileImageUrl: (profile.linkedinProfileImageUrl as string) || "",
  };
  console.log("[PhantomBuster] Parsed profile:", JSON.stringify(result));
  return result;
}

export async function enrichLinkedInProfile(
  linkedinUrl: string
): Promise<EnrichedProfile | null> {
  const agentId = process.env.PHANTOMBUSTER_AGENT_ID;
  const apiKey = process.env.PHANTOMBUSTER_API_KEY;

  if (!agentId || !apiKey) {
    console.warn("PhantomBuster env vars not configured, skipping enrichment");
    return null;
  }

  try {
    // 0. Fetch the agent's saved argument so we preserve identities/sessionCookie
    console.log("[PhantomBuster] Fetching agent config...");
    const agentRes = await fetch(`${API_BASE}/agents/fetch?id=${agentId}`, {
      headers: getHeaders(),
    });

    if (!agentRes.ok) {
      console.warn("[PhantomBuster] Agent fetch failed:", agentRes.status);
      return null;
    }

    const agentData = await agentRes.json();
    const savedArgument = typeof agentData.argument === "string"
      ? JSON.parse(agentData.argument)
      : agentData.argument || {};

    // Only keep the fields needed for launch — override URL and limit to 1 profile
    const launchArgument = {
      ...savedArgument,
      spreadsheetUrl: linkedinUrl,
      numberOfAddsPerLaunch: 1,
    };

    // 1. Launch the phantom
    console.log("[PhantomBuster] Launching phantom...");
    const launchRes = await fetch(`${API_BASE}/agents/launch`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        id: agentId,
        argument: launchArgument,
      }),
    });

    if (!launchRes.ok) {
      const errText = await launchRes.text();
      console.warn("[PhantomBuster] Launch failed:", launchRes.status, errText);
      return null;
    }

    const launchData = await launchRes.json();
    const containerId = launchData.containerId;
    console.log("[PhantomBuster] Container launched:", containerId);

    if (!containerId) {
      console.warn("[PhantomBuster] No containerId in response:", JSON.stringify(launchData));
      return null;
    }

    // 2. Poll for completion
    const startTime = Date.now();
    let finished = false;
    while (Date.now() - startTime < MAX_POLL_MS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const statusRes = await fetch(
        `${API_BASE}/containers/fetch?id=${containerId}`,
        { headers: getHeaders() }
      );

      if (!statusRes.ok) {
        console.warn("[PhantomBuster] Poll failed:", statusRes.status);
        continue;
      }

      const statusData = await statusRes.json();
      console.log("[PhantomBuster] Status:", statusData.status, "exitCode:", statusData.exitCode);

      if (statusData.status === "finished" || statusData.status === "success") {
        if (statusData.exitCode && statusData.exitCode !== 0) {
          console.warn("[PhantomBuster] Finished with error exitCode:", statusData.exitCode);
          return null;
        }
        finished = true;
        break;
      }

      if (statusData.status === "error" || statusData.status === "launch error") {
        console.warn("[PhantomBuster] Container error:", JSON.stringify(statusData));
        return null;
      }
    }

    if (!finished) {
      console.warn("[PhantomBuster] Timed out after", MAX_POLL_MS, "ms");
      return null;
    }

    // 3. Fetch container-specific output (NOT agent-level, which could return another user's data)
    console.log("[PhantomBuster] Fetching container output for:", containerId);
    const outputRes = await fetch(
      `${API_BASE}/containers/fetch-output?id=${containerId}`,
      { headers: getHeaders() }
    );

    if (!outputRes.ok) {
      console.warn("[PhantomBuster] Container fetch-output failed:", outputRes.status);
      return null;
    }

    const outputData = await outputRes.json();
    const outputLog = (outputData.output as string) || "";
    console.log("[PhantomBuster] Container output tail:", outputLog.slice(-500));

    // Results are saved to S3 — extract the JSON URL from the output logs
    const jsonUrlMatch = outputLog.match(/JSON saved at (https:\/\/\S+\.json)/);

    if (!jsonUrlMatch) {
      // Fallback: try the known S3 path, but ONLY trust results that match the requested URL
      const s3Folder = agentData.s3Folder;
      const orgS3Folder = agentData.orgS3Folder;
      if (s3Folder && orgS3Folder) {
        const s3Url = `https://phantombuster.s3.amazonaws.com/${orgS3Folder}/${s3Folder}/result.json`;
        console.log("[PhantomBuster] No JSON URL in output, trying known S3 path:", s3Url);
        const resultRes = await fetch(s3Url);
        if (resultRes.ok) {
          const results: Record<string, unknown>[] = await resultRes.json();
          if (results.length) {
            return parseProfile(results, linkedinUrl);
          }
        }
      }
      console.warn("[PhantomBuster] No result JSON found.");
      return null;
    }

    // 4. Fetch the actual result data from S3
    console.log("[PhantomBuster] Fetching results from:", jsonUrlMatch[1]);
    const resultRes = await fetch(jsonUrlMatch[1]);
    if (!resultRes.ok) {
      console.warn("[PhantomBuster] Result fetch failed:", resultRes.status);
      return null;
    }

    const results: Record<string, unknown>[] = await resultRes.json();

    if (!results.length) {
      console.warn("[PhantomBuster] No results in JSON file");
      return null;
    }

    return parseProfile(results, linkedinUrl);
  } catch (err) {
    console.warn("PhantomBuster enrichment error:", err);
    return null;
  }
}
