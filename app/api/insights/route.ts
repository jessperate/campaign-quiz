import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

const ARCHETYPE_LABELS: Record<string, string> = {
  vision: "The Visionary",
  glue: "The Glue",
  maverick: "The Maverick",
  craft: "The Craftsperson",
  spark: "The Spark",
  flex: "The Flex",
  heart: "The Heart",
};

export async function GET() {
  try {
    let cursor = "0";
    const archetypeCounts: Record<string, number> = {};
    const roleCounts: Record<string, number> = { ic: 0, manager: 0, executive: 0 };
    const archetypeByRole: Record<string, Record<string, number>> = {
      ic: {},
      manager: {},
      executive: {},
    };
    const dailyCounts: Record<string, number> = {};
    const companyCounts: Record<string, number> = {};
    let wantsDemoCount = 0;
    let total = 0;

    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "quiz:*", "COUNT", 200);
      cursor = nextCursor;

      if (keys.length === 0) continue;

      const values = await redis.mget(...keys);
      for (const val of values) {
        if (!val) continue;
        let data: Record<string, any>;
        try {
          data = JSON.parse(val);
        } catch {
          continue;
        }

        total++;

        const archetypeId: string = data.archetype?.id || "unknown";
        const role: string = data.role || "unknown";
        const createdAt: string = data.createdAt || "";
        const company: string = (data.company || "").trim();

        // Archetype counts
        archetypeCounts[archetypeId] = (archetypeCounts[archetypeId] || 0) + 1;

        // Role counts
        if (role in roleCounts) roleCounts[role]++;

        // Archetype by role
        if (role in archetypeByRole) {
          archetypeByRole[role][archetypeId] = (archetypeByRole[role][archetypeId] || 0) + 1;
        }

        // Daily trend
        if (createdAt) {
          const day = createdAt.slice(0, 10); // "YYYY-MM-DD"
          dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        }

        // Company counts (exclude blank / test entries)
        if (company && company.length > 1 && company.toLowerCase() !== "test") {
          companyCounts[company] = (companyCounts[company] || 0) + 1;
        }

        // Demo interest
        if (data.wantsDemo) wantsDemoCount++;
      }
    } while (cursor !== "0");

    // Sort archetypes by count desc
    const archetypeRanked = Object.entries(archetypeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => ({
        id,
        label: ARCHETYPE_LABELS[id] || id,
        count,
        pct: Math.round((count / total) * 100),
      }));

    // Sort daily counts
    const dailyTrend = Object.entries(dailyCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    // Top 15 companies
    const topCompanies = Object.entries(companyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));

    // Archetype by role: rank within each role
    const archetypeByRoleRanked: Record<string, { id: string; label: string; count: number; pct: number }[]> = {};
    for (const role of ["ic", "manager", "executive"]) {
      const roleTotal = roleCounts[role] || 1;
      archetypeByRoleRanked[role] = Object.entries(archetypeByRole[role] || {})
        .sort((a, b) => b[1] - a[1])
        .map(([id, count]) => ({
          id,
          label: ARCHETYPE_LABELS[id] || id,
          count,
          pct: Math.round((count / roleTotal) * 100),
        }));
    }

    return NextResponse.json({
      total,
      roleCounts,
      rolePcts: {
        ic: Math.round((roleCounts.ic / total) * 100),
        manager: Math.round((roleCounts.manager / total) * 100),
        executive: Math.round((roleCounts.executive / total) * 100),
      },
      archetypeRanked,
      archetypeByRole: archetypeByRoleRanked,
      dailyTrend,
      topCompanies,
      wantsDemoCount,
      wantsDemoPct: Math.round((wantsDemoCount / total) * 100),
    });
  } catch (err) {
    console.error("Insights API error:", err);
    return NextResponse.json({ error: "Failed to load insights" }, { status: 500 });
  }
}
