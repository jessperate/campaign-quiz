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
    // 1. Launch the phantom
    const launchRes = await fetch(`${API_BASE}/agents/launch`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        id: agentId,
        argument: { spreadsheetUrl: linkedinUrl },
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
        break;
      }

      if (statusData.status === "error" || statusData.status === "launch error") {
        console.warn("PhantomBuster container error:", statusData);
        return null;
      }
    }

    // 3. Fetch output
    const outputRes = await fetch(
      `${API_BASE}/agents/fetch-output?id=${agentId}`,
      { headers: getHeaders() }
    );

    if (!outputRes.ok) {
      console.warn("PhantomBuster fetch-output failed:", outputRes.status);
      return null;
    }

    const outputData = await outputRes.json();

    // Parse the result - output is typically a JSON string in resultObject
    let results: Record<string, unknown>[];
    if (typeof outputData.resultObject === "string") {
      results = JSON.parse(outputData.resultObject);
    } else if (Array.isArray(outputData.resultObject)) {
      results = outputData.resultObject;
    } else {
      console.warn("PhantomBuster unexpected output format:", outputData);
      return null;
    }

    if (!results.length) {
      console.warn("PhantomBuster returned no results");
      return null;
    }

    const profile = results[0];

    // PhantomBuster LinkedIn Profile Scraper fields:
    // firstName, lastName, company, title (or jobTitle)
    const firstName = (profile.firstName as string) || "";
    const lastName = (profile.lastName as string) || "";
    const fullName = (profile.fullName as string) || "";

    // Fallback: split fullName if first/last not present
    let resolvedFirst = firstName;
    let resolvedLast = lastName;
    if (!resolvedFirst && !resolvedLast && fullName) {
      const parts = fullName.trim().split(/\s+/);
      resolvedFirst = parts[0] || "";
      resolvedLast = parts.slice(1).join(" ") || "";
    }

    return {
      firstName: resolvedFirst,
      lastName: resolvedLast,
      company: (profile.company as string) || (profile.companyName as string) || "",
      title: (profile.title as string) || (profile.jobTitle as string) || "",
      profileImageUrl: (profile.imgUrl as string) || (profile.profileImageUrl as string) || "",
    };
  } catch (err) {
    console.warn("PhantomBuster enrichment error:", err);
    return null;
  }
}
