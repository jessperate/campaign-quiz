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
    const url = normalizeLinkedInUrl(
      (r.profileUrl as string) || (r.linkedinProfileUrl as string) || (r.linkedinProfile as string) || ""
    );
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

/**
 * Parse CSV into an array of objects. Handles quoted fields with commas,
 * newlines inside quotes, and escaped quotes ("").
 */
function parseCsv(csvText: string): Record<string, string>[] {
  // Normalize \r\n to \n, standalone \r to \n
  const text = csvText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // State-machine parser: splits text into rows of fields,
  // correctly handling quoted fields that contain commas or newlines.
  const rows: string[][] = [];
  let fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // End of quoted field
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        fields.push(current);
        current = "";
      } else if (ch === "\n") {
        fields.push(current);
        current = "";
        rows.push(fields);
        fields = [];
      } else {
        current += ch;
      }
    }
  }

  // Push last field/row
  if (current || fields.length > 0) {
    fields.push(current);
    rows.push(fields);
  }

  if (rows.length < 2) return [];

  const headers = rows[0];
  const results: Record<string, string>[] = [];
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    // Skip empty/malformed rows
    if (values.length < 2) continue;
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = (values[j] || "").trim();
    }
    results.push(obj);
  }
  return results;
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

    // 3. Try container-specific result object first (fastest, per-container data)
    console.log("[PhantomBuster] Fetching container result object for:", containerId);
    try {
      const resultObjRes = await fetch(
        `${API_BASE}/containers/fetch-result-object?id=${containerId}`,
        { headers: getHeaders() }
      );
      if (resultObjRes.ok) {
        const resultObjData = await resultObjRes.json();
        if (resultObjData.resultObject) {
          const results = Array.isArray(resultObjData.resultObject)
            ? resultObjData.resultObject
            : [resultObjData.resultObject];
          const profile = parseProfile(results as Record<string, unknown>[], linkedinUrl);
          if (profile) return profile;
        }
      }
    } catch (err) {
      console.warn("[PhantomBuster] fetch-result-object failed:", err);
    }

    // 4. Try console output for JSON URL (works for fresh non-deduped scrapes)
    console.log("[PhantomBuster] Fetching container output for:", containerId);
    const outputRes = await fetch(
      `${API_BASE}/containers/fetch-output?id=${containerId}`,
      { headers: getHeaders() }
    );

    if (outputRes.ok) {
      const outputData = await outputRes.json();
      const outputLog = (outputData.output as string) || "";
      console.log("[PhantomBuster] Container output tail:", outputLog.slice(-500));

      const jsonUrlMatch = outputLog.match(/JSON saved at (https:\/\/\S+\.json)/);
      if (jsonUrlMatch) {
        console.log("[PhantomBuster] Fetching results from:", jsonUrlMatch[1]);
        const resultRes = await fetch(jsonUrlMatch[1]);
        if (resultRes.ok) {
          const results: Record<string, unknown>[] = await resultRes.json();
          const profile = parseProfile(results, linkedinUrl);
          if (profile) return profile;
        }
      }
    }

    // 5. Fallback: check S3 result.json, then result.csv (has ALL accumulated profiles)
    const s3Folder = agentData.s3Folder;
    const orgS3Folder = agentData.orgS3Folder;
    if (s3Folder && orgS3Folder) {
      const s3Base = `https://phantombuster.s3.amazonaws.com/${orgS3Folder}/${s3Folder}`;

      // Try result.json first (fast, but only has latest run's data)
      try {
        const jsonRes = await fetch(`${s3Base}/result.json`);
        if (jsonRes.ok) {
          const results: Record<string, unknown>[] = await jsonRes.json();
          const profile = parseProfile(results, linkedinUrl);
          if (profile) return profile;
        }
      } catch (err) {
        console.warn("[PhantomBuster] S3 result.json fetch failed:", err);
      }

      // Try result.csv — contains ALL profiles accumulated across all runs
      // This handles the deduplication case where a profile was scraped previously
      console.log("[PhantomBuster] Trying S3 result.csv (accumulated results)...");
      try {
        const csvRes = await fetch(`${s3Base}/result.csv`);
        if (csvRes.ok) {
          const csvText = await csvRes.text();
          const csvResults = parseCsv(csvText);
          console.log("[PhantomBuster] CSV has", csvResults.length, "accumulated profiles");
          const profile = parseProfile(csvResults as Record<string, unknown>[], linkedinUrl);
          if (profile) return profile;
        }
      } catch (err) {
        console.warn("[PhantomBuster] S3 result.csv fetch failed:", err);
      }
    }

    console.warn("[PhantomBuster] No matching profile found in any result source.");
    return null;
  } catch (err) {
    console.warn("PhantomBuster enrichment error:", err);
    return null;
  }
}
