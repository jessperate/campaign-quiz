import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { icQuestions, managerQuestions, executiveQuestions, type Question } from "@/lib/quiz-data";

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

type AnswerCounts = Record<string, Record<string, Record<string, number>>>;

const QUESTIONS_BY_ROLE: Record<string, Question[]> = {
  ic: icQuestions,
  manager: managerQuestions,
  executive: executiveQuestions,
};

function estimateAnswerDistributions(
  archetypeByRole: Record<string, Record<string, number>>,
  roleCounts: Record<string, number>
): Record<string, Record<string, { answer: string; count: number; pct: number }[]>> {
  const result: Record<string, Record<string, { answer: string; count: number; pct: number }[]>> = {};

  for (const role of ["ic", "manager", "executive"]) {
    result[role] = {};
    const archCounts = archetypeByRole[role] || {};
    const questions = QUESTIONS_BY_ROLE[role];

    for (const question of questions) {
      const qAnswers: { answer: string; count: number; pct: number }[] = [];

      for (const option of question.options) {
        // Use the first archetype signal for this option as the proxy count
        const signal = option.signals[0];
        const count = signal ? (archCounts[signal] || 0) : 0;
        qAnswers.push({ answer: option.id, count, pct: 0 });
      }

      const qTotal = qAnswers.reduce((s, a) => s + a.count, 0);
      for (const a of qAnswers) {
        a.pct = qTotal > 0 ? Math.round((a.count / qTotal) * 100) : 0;
      }

      qAnswers.sort((a, b) => b.count - a.count);
      result[role][question.id] = qAnswers;
    }
  }

  return result;
}

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
    const answerCounts: AnswerCounts = { ic: {}, manager: {}, executive: {} };
    let answeredSubmissions = 0;
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

        archetypeCounts[archetypeId] = (archetypeCounts[archetypeId] || 0) + 1;

        if (role in roleCounts) roleCounts[role]++;

        if (role in archetypeByRole) {
          archetypeByRole[role][archetypeId] = (archetypeByRole[role][archetypeId] || 0) + 1;
        }

        if (createdAt) {
          const day = createdAt.slice(0, 10);
          dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        }

        if (company && company.length > 1 && company.toLowerCase() !== "test") {
          companyCounts[company] = (companyCounts[company] || 0) + 1;
        }

        if (data.wantsDemo) wantsDemoCount++;

        if (data.answers && role in answerCounts) {
          answeredSubmissions++;
          for (const [qKey, answer] of Object.entries(data.answers as Record<string, string>)) {
            if (qKey === "q1") continue;
            if (!answerCounts[role][qKey]) answerCounts[role][qKey] = {};
            answerCounts[role][qKey][answer] = (answerCounts[role][qKey][answer] || 0) + 1;
          }
        }
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

    const dailyTrend = Object.entries(dailyCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    const topCompanies = Object.entries(companyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));

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

    // Use real answer data if available, otherwise estimate from archetype distribution
    let answerDistributions: Record<string, Record<string, { answer: string; count: number; pct: number }[]>>;
    let isEstimated = false;

    if (answeredSubmissions > 0) {
      answerDistributions = { ic: {}, manager: {}, executive: {} };
      for (const role of ["ic", "manager", "executive"]) {
        for (const [qKey, answers] of Object.entries(answerCounts[role] || {})) {
          const qTotal = Object.values(answers).reduce((s, c) => s + c, 0);
          answerDistributions[role][qKey] = Object.entries(answers)
            .sort((a, b) => b[1] - a[1])
            .map(([answer, count]) => ({
              answer,
              count,
              pct: Math.round((count / qTotal) * 100),
            }));
        }
      }
    } else {
      answerDistributions = estimateAnswerDistributions(archetypeByRole, roleCounts);
      isEstimated = true;
    }

    return NextResponse.json({
      total,
      answeredSubmissions,
      isEstimated,
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
      answerDistributions,
    });
  } catch (err) {
    console.error("Insights API error:", err);
    return NextResponse.json({ error: "Failed to load insights" }, { status: 500 });
  }
}
