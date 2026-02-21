"use client";

import { useState, useEffect } from "react";

interface ArchetypeEntry {
  id: string;
  label: string;
  count: number;
  pct: number;
}

interface InsightsData {
  total: number;
  roleCounts: { ic: number; manager: number; executive: number };
  rolePcts: { ic: number; manager: number; executive: number };
  archetypeRanked: ArchetypeEntry[];
  archetypeByRole: Record<string, ArchetypeEntry[]>;
  dailyTrend: { date: string; count: number }[];
  topCompanies: { name: string; count: number }[];
  wantsDemoCount: number;
  wantsDemoPct: number;
}

const ARCHETYPE_COLORS: Record<string, string> = {
  vision: "#1a5c35",
  glue: "#2d7a4f",
  maverick: "#4ADE80",
  craft: "#0D3D1F",
  spark: "#38a169",
  flex: "#68d391",
  heart: "#276749",
};

const ARCHETYPE_INSIGHTS: Record<string, string> = {
  vision: "Visionaries are strategic thinkers who connect content to business outcomes. They're the most likely to be evaluating platforms at the leadership level and respond to ROI-driven messaging.",
  glue: "The Glue marketers are process architects — they build the systems that scale teams. They're drawn to workflow automation and are influential internal champions for new tools.",
  maverick: "Mavericks move first. They're already experimenting with AEO and AI-native workflows. They respond to cutting-edge positioning and want to be ahead of the curve.",
  craft: "Craftspeople prioritize quality over speed. In an era of AI-generated slop, they're the brand guardians. They need to see how tools enhance — not replace — creative standards.",
  spark: "Sparks are the execution engine. They ship fast and hit deadlines. They respond to productivity gains, speed metrics, and anything that helps them do more without burning out.",
  flex: "Flex marketers are situational adapters — they read the room and adjust. They're versatile and often in cross-functional roles. They need tools that work across contexts.",
  heart: "Heart marketers are people-first and growth-oriented. Often earlier in their careers or building teams. They respond to community, education, and collaborative messaging.",
};

const ROLE_LABELS: Record<string, string> = {
  ic: "Individual Contributors",
  manager: "Managers",
  executive: "Executives",
};

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <div
        className="h-3 rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function generateInsightsSynthesis(data: InsightsData): string[] {
  const top = data.archetypeRanked[0];
  const second = data.archetypeRanked[1];
  const topRole = Object.entries(data.roleCounts).sort((a, b) => b[1] - a[1])[0][0];

  const insights: string[] = [];

  // Top archetype insight
  if (top) {
    const topPct = top.pct;
    if (top.id === "craft" || top.id === "vision") {
      insights.push(
        `${topPct}% of respondents identify as ${top.label}s — the largest segment. This signals a market that's grappling with quality and strategy in an AI-saturated landscape. These marketers aren't looking for shortcuts; they want tools that help them do their best work at scale.`
      );
    } else if (top.id === "maverick") {
      insights.push(
        `${topPct}% of respondents are Mavericks — a strong signal that this audience is AI-forward and willing to experiment. They're likely already using AEO tools and are primed for advanced workflows rather than introductory content.`
      );
    } else if (top.id === "spark") {
      insights.push(
        `${topPct}% of respondents are Sparks — execution-focused marketers who measure success by output and speed. Lead with velocity: how much more can they ship, and how fast?`
      );
    } else {
      insights.push(
        `${topPct}% of respondents identify as ${top.label}s — the largest single segment. Tailoring messaging to this archetype's core values will resonate with the majority of this audience.`
      );
    }
  }

  // Second archetype
  if (second && top) {
    insights.push(
      `The second-largest group — ${second.label}s at ${second.pct}% — combined with ${top.label}s represents over ${top.pct + second.pct}% of the audience. Content that bridges these two orientations (${top.id} + ${second.id}) will have the broadest reach.`
    );
  }

  // Role split insight
  if (topRole === "ic") {
    insights.push(
      `Individual contributors make up ${data.rolePcts.ic}% of respondents. This is a practitioner-heavy audience — content should be tactical, hands-on, and workflow-oriented rather than leadership-focused.`
    );
  } else if (topRole === "manager") {
    insights.push(
      `Managers are the dominant role at ${data.rolePcts.manager}%. This audience is accountable for team output and cares about scaling quality while managing people. They're the bridge between strategy and execution.`
    );
  } else if (topRole === "executive") {
    insights.push(
      `Executives represent ${data.rolePcts.executive}% of respondents — a notably high leadership concentration. This audience can authorize budget and champion platform adoption. ROI and competitive differentiation are the keys to converting them.`
    );
  }

  // Demo interest
  if (data.wantsDemoPct >= 30) {
    insights.push(
      `${data.wantsDemoPct}% of respondents requested a demo — a strong conversion signal. This audience is actively in-market, not just browsing.`
    );
  } else if (data.wantsDemoPct > 0) {
    insights.push(
      `${data.wantsDemoPct}% of respondents opted in for a demo. There's an opportunity to increase this with stronger in-quiz intent signals or a more prominent CTA.`
    );
  }

  return insights;
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string>("all");

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">Loading insights...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error || "No data"}</div>
      </div>
    );
  }

  const maxDaily = Math.max(...data.dailyTrend.map((d) => d.count), 1);
  const insights = generateInsightsSynthesis(data);
  const archetypeList =
    activeRole === "all"
      ? data.archetypeRanked
      : data.archetypeByRole[activeRole] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Insights</h1>
            <p className="text-gray-500 mt-1">
              Aggregate data from <span className="font-semibold text-gray-700">{data.total.toLocaleString()}</span> submissions
            </p>
          </div>
          <a
            href="/admin/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700 underline mt-1"
          >
            ← Dashboard
          </a>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-3xl font-bold text-gray-900">{data.total.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">Total Submissions</div>
          </Card>
          <Card>
            <div className="text-3xl font-bold" style={{ color: "#1a5c35" }}>
              {data.rolePcts.ic}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Individual Contributors</div>
          </Card>
          <Card>
            <div className="text-3xl font-bold" style={{ color: "#2d7a4f" }}>
              {data.rolePcts.manager}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Managers</div>
          </Card>
          <Card>
            <div className="text-3xl font-bold" style={{ color: "#0D3D1F" }}>
              {data.wantsDemoPct}%
            </div>
            <div className="text-sm text-gray-500 mt-1">Requested a Demo</div>
          </Card>
        </div>

        {/* Marketer Synthesis */}
        <Card>
          <SectionHeader
            title="What This Tells Us About Marketers"
            subtitle="Synthesized from archetype distribution, role split, and demo intent"
          />
          <div className="space-y-4">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ARCHETYPE_COLORS[data.archetypeRanked[i]?.id] || "#4ADE80" }}
                />
                <p className="text-gray-700 leading-relaxed text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Archetype Distribution */}
        <Card>
          <div className="flex items-center justify-between mb-5">
            <SectionHeader
              title="Archetype Distribution"
              subtitle="Who your audience thinks they are"
            />
            <div className="flex gap-1 text-xs">
              {["all", "ic", "manager", "executive"].map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-3 py-1 rounded-full border transition-colors ${
                    activeRole === role
                      ? "bg-gray-900 text-white border-gray-900"
                      : "text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {role === "all" ? "All" : ROLE_LABELS[role].split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {archetypeList.map((arch) => (
              <div key={arch.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-800">{arch.label}</span>
                  <span className="text-gray-500">
                    {arch.count.toLocaleString()} &middot; {arch.pct}%
                  </span>
                </div>
                <Bar pct={arch.pct} color={ARCHETYPE_COLORS[arch.id] || "#4ADE80"} />
              </div>
            ))}
          </div>
        </Card>

        {/* Archetype Deep Dive */}
        <Card>
          <SectionHeader
            title="What Each Archetype Needs"
            subtitle="Messaging and content implications by segment"
          />
          <div className="grid md:grid-cols-2 gap-4">
            {data.archetypeRanked.map((arch) => (
              <div
                key={arch.id}
                className="rounded-lg p-4 border"
                style={{ borderColor: ARCHETYPE_COLORS[arch.id] + "40", backgroundColor: ARCHETYPE_COLORS[arch.id] + "08" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 text-sm">{arch.label}</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: ARCHETYPE_COLORS[arch.id] }}
                  >
                    {arch.pct}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {ARCHETYPE_INSIGHTS[arch.id]}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Role Breakdown */}
        <Card>
          <SectionHeader title="Role Breakdown" />
          <div className="space-y-4">
            {(["ic", "manager", "executive"] as const).map((role) => (
              <div key={role}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-800">{ROLE_LABELS[role]}</span>
                  <span className="text-gray-500">
                    {data.roleCounts[role].toLocaleString()} &middot; {data.rolePcts[role]}%
                  </span>
                </div>
                <Bar pct={data.rolePcts[role]} color="#0D3D1F" />
              </div>
            ))}
          </div>
        </Card>

        {/* Daily Trend */}
        <Card>
          <SectionHeader title="Submissions by Day" />
          <div className="flex items-end gap-1 h-32">
            {data.dailyTrend.map(({ date, count }) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                  {count} on {date}
                </div>
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${(count / maxDaily) * 100}%`,
                    backgroundColor: "#4ADE80",
                    minHeight: "2px",
                  }}
                />
                <span className="text-xs text-gray-400 rotate-45 origin-left hidden md:block" style={{ fontSize: "9px" }}>
                  {date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Companies */}
        <Card>
          <SectionHeader title="Top Companies" subtitle="By submission volume" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {data.topCompanies.map(({ name, count }, i) => (
              <div
                key={name}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4">{i + 1}.</span>
                  <span className="text-sm text-gray-800 font-medium truncate">{name}</span>
                </div>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
