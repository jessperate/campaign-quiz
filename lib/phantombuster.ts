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
    const agentRes = await fetch(`${API_BASE}/agents/fetch?id=${agentId}`, {
      headers: getHeaders(),
    });

    if (!agentRes.ok) {
      console.warn("PhantomBuster agent fetch failed:", agentRes.status);
      return null;
    }

    const agentData = await agentRes.json();
    const savedArgument = typeof agentData.argument === "string"
      ? JSON.parse(agentData.argument)
      : agentData.argument || {};

    // 1. Launch the phantom, merging saved config with our URL
    const launchRes = await fetch(`${API_BASE}/agents/launch`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        id: agentId,
        argument: { ...savedArgument, spreadsheetUrl: linkedinUrl },
      }),
    });

    if (!launchRes.ok) {
      console.warn("PhantomBuster launch failed:", launchRes.status, await launchRes.text());
      return null;
    }

    const launchData = await launchRes.json();
    const containerId = launchData.containerId;

    if (!containerId) {
      console.warn("PhantomBuster launch returned no containerId:", launchData);
      return null;
    }

    // 2. Poll for completion
    const startTime = Date.now();
    while (Date.now() - startTime < MAX_POLL_MS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const statusRes = await fetch(
        `${API_BASE}/containers/fetch?id=${containerId}`,
        { headers: getHeaders() }
      );

      if (!statusRes.ok) {
        console.warn("PhantomBuster poll failed:", statusRes.status);
        continue;
      }

      const statusData = await statusRes.json();

      if (statusData.status === "finished" || statusData.status === "success") {
        if (statusData.exitCode && statusData.exitCode !== 0) {
          console.warn("PhantomBuster container finished with error exitCode:", statusData.exitCode);
          return null;
        }
        break;
      }

      if (statusData.status === "error" || statusData.status === "launch error") {
        console.warn("PhantomBuster container error:", statusData);
        return null;
      }
    }

    // 3. Fetch output to find the result JSON URL
    const outputRes = await fetch(
      `${API_BASE}/agents/fetch-output?id=${agentId}`,
      { headers: getHeaders() }
    );

    if (!outputRes.ok) {
      console.warn("PhantomBuster fetch-output failed:", outputRes.status);
      return null;
    }

    const outputData = await outputRes.json();

    // Results are saved to S3 — extract the JSON URL from the output logs
    const outputLog = (outputData.output as string) || "";
    const jsonUrlMatch = outputLog.match(/JSON saved at (https:\/\/\S+\.json)/);

    if (!jsonUrlMatch) {
      console.warn("PhantomBuster output has no result JSON URL:", outputLog.slice(-500));
      return null;
    }

    // 4. Fetch the actual result data from S3
    const resultRes = await fetch(jsonUrlMatch[1]);
    if (!resultRes.ok) {
      console.warn("PhantomBuster result fetch failed:", resultRes.status);
      return null;
    }

    const results: Record<string, unknown>[] = await resultRes.json();

    if (!results.length) {
      console.warn("PhantomBuster returned no results");
      return null;
    }

    // Find the matching profile (result.json accumulates all runs)
    const normalizedInput = linkedinUrl.replace(/\/+$/, "").toLowerCase();
    const profile = results.find((r) => {
      const url = ((r.profileUrl as string) || "").replace(/\/+$/, "").toLowerCase();
      return url === normalizedInput;
    }) || results[results.length - 1];

    return {
      firstName: (profile.firstName as string) || "",
      lastName: (profile.lastName as string) || "",
      company: (profile.companyName as string) || "",
      title: (profile.linkedinJobTitle as string) || (profile.linkedinHeadline as string) || "",
      profileImageUrl: (profile.linkedinProfileImageUrl as string) || "",
    };
  } catch (err) {
    console.warn("PhantomBuster enrichment error:", err);
    return null;
  }
}
