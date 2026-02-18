"use client";

import { useEffect, useState, useMemo } from "react";

const ARCHETYPE_ORDER = ["vision", "glue", "maverick", "craft", "spark", "flex", "heart"];
const ARCHETYPE_LABELS: Record<string, string> = {
  vision: "Vision",
  glue: "Glue",
  maverick: "Maverick",
  craft: "Craft",
  spark: "Spark",
  flex: "Flex",
  heart: "Heart",
};
const ARCHETYPE_COLORS: Record<string, { bg: string; accent: string }> = {
  vision: { bg: "#0A2A3D", accent: "#CCE8F5" },
  glue: { bg: "#242603", accent: "#EEFF8C" },
  maverick: { bg: "#1A1A3D", accent: "#D6D6FF" },
  craft: { bg: "#1E1A3D", accent: "#DDD3F2" },
  spark: { bg: "#3D0A1A", accent: "#FFD6E0" },
  flex: { bg: "#1A2E22", accent: "#DDE8E0" },
  heart: { bg: "#3D0A3D", accent: "#F5D6F5" },
};

const ROLE_OPTIONS = [
  { value: "", label: "All" },
  { value: "ic", label: "IC" },
  { value: "manager", label: "Manager" },
  { value: "exec", label: "Exec" },
];

interface CardData {
  userId: string;
  firstName: string;
  lastName: string;
  company: string;
  archetypeId: string;
  archetypeName: string;
  role: string;
  createdAt: string;
}

export default function TrackerPage() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyFilter, setCompanyFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today">("today");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/all-cards")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.cards) setCards(data.cards);
        else setError("No cards in response");
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  // Get unique companies for autocomplete
  const companies = useMemo(() => {
    const set = new Set<string>();
    for (const card of cards) {
      if (card.company) set.add(card.company);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [cards]);

  // Filter cards by company, role, and date
  const filteredCards = useMemo(() => {
    let result = cards;

    // Date filter
    if (dateFilter === "today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      result = result.filter((c) => {
        const cardDate = new Date(c.createdAt);
        return cardDate >= todayStart;
      });
    }

    if (companyFilter.trim()) {
      const q = companyFilter.trim().toLowerCase();
      result = result.filter((c) => c.company.toLowerCase().includes(q));
    }
    if (roleFilter) {
      result = result.filter((c) => c.role === roleFilter);
    }
    return result;
  }, [cards, companyFilter, roleFilter, dateFilter]);

  // Compute counts from filtered cards
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const card of filteredCards) {
      c[card.archetypeId] = (c[card.archetypeId] || 0) + 1;
    }
    return c;
  }, [filteredCards]);

  const totalPlayers = Object.values(counts).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...Object.values(counts), 1);
  const sorted = [...ARCHETYPE_ORDER].sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
  const leaderId = sorted[0];

  // Matching companies for dropdown
  const matchingCompanies = useMemo(() => {
    if (!companyFilter.trim()) return [];
    const q = companyFilter.trim().toLowerCase();
    return companies.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
  }, [companies, companyFilter]);

  // Recent players for the filtered set
  const recentPlayers = filteredCards.slice(0, 20);

  // Companies with multiple submissions
  const topCompanies = useMemo(() => {
    const companyCounts = new Map<string, number>();
    for (const card of cards) {
      if (card.company) {
        companyCounts.set(card.company, (companyCounts.get(card.company) || 0) + 1);
      }
    }
    return [...companyCounts.entries()]
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [cards]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <p
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 600,
            color: "#00FF64",
            marginBottom: 8,
            fontFamily: "SaansMono, monospace",
          }}
        >
          Marketype Tracker
        </p>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 400,
            marginBottom: 24,
            fontFamily: "SerrifVF, Serrif, Georgia, serif",
          }}
        >
          Which Marketype is in the lead?
        </h1>

        {/* Date filter toggle */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { value: "today", label: "Today" },
              { value: "all", label: "All Time" },
            ].map((opt) => {
              const isActive = dateFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setDateFilter(opt.value as "all" | "today")}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: isActive ? "1px solid #00FF64" : "1px solid rgba(255,255,255,0.15)",
                    background: isActive ? "rgba(0,255,100,0.12)" : "rgba(255,255,255,0.05)",
                    color: isActive ? "#00FF64" : "rgba(255,255,255,0.7)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "SaansMono, monospace",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Companies */}
        {!loading && topCompanies.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 12,
                fontFamily: "SaansMono, monospace",
              }}
            >
              Companies with multiple submissions
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {topCompanies.map(([company, count]) => {
                const isActive = companyFilter === company;
                return (
                  <button
                    key={company}
                    onClick={() => setCompanyFilter(company)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 8,
                      border: isActive ? "1px solid #00FF64" : "1px solid rgba(255,255,255,0.15)",
                      background: isActive ? "rgba(0,255,100,0.12)" : "rgba(255,255,255,0.05)",
                      color: isActive ? "#00FF64" : "white",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "Saans, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                      }
                    }}
                  >
                    <span>{company}</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: isActive ? "#00FF64" : "rgba(255,255,255,0.4)",
                        fontFamily: "SaansMono, monospace",
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Company filter */}
        <div style={{ position: "relative", marginBottom: 32 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 8,
              fontFamily: "SaansMono, monospace",
            }}
          >
            Filter by company
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              placeholder="Type a company name..."
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.05)",
                color: "white",
                fontSize: 15,
                fontFamily: "Saans, system-ui, sans-serif",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#00FF64")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
            />
            {companyFilter && (
              <button
                onClick={() => setCompanyFilter("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 18,
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
              >
                ✕
              </button>
            )}
          </div>
          {/* Company suggestions dropdown */}
          {matchingCompanies.length > 0 && companyFilter.trim() && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                marginTop: 4,
                zIndex: 10,
                maxHeight: 240,
                overflowY: "auto",
              }}
            >
              {matchingCompanies.map((c) => (
                <button
                  key={c}
                  onClick={() => setCompanyFilter(c)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    color: "white",
                    fontSize: 14,
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    fontFamily: "Saans, system-ui, sans-serif",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Role filter */}
        <div style={{ marginBottom: 32 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 8,
              fontFamily: "SaansMono, monospace",
            }}
          >
            Filter by role
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {ROLE_OPTIONS.map((opt) => {
              const isActive = roleFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setRoleFilter(opt.value)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 20,
                    border: isActive ? "1px solid #00FF64" : "1px solid rgba(255,255,255,0.15)",
                    background: isActive ? "rgba(0,255,100,0.12)" : "rgba(255,255,255,0.05)",
                    color: isActive ? "#00FF64" : "rgba(255,255,255,0.7)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "SaansMono, monospace",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats summary */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 32,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              padding: "16px 20px",
              flex: 1,
              minWidth: 140,
            }}
          >
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontFamily: "SaansMono, monospace" }}>
              Total Players
            </p>
            <p style={{ fontSize: 28, fontWeight: 600, fontFamily: "SaansMono, monospace" }}>
              {loading ? "..." : totalPlayers}
            </p>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              padding: "16px 20px",
              flex: 1,
              minWidth: 140,
            }}
          >
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontFamily: "SaansMono, monospace" }}>
              Companies
            </p>
            <p style={{ fontSize: 28, fontWeight: 600, fontFamily: "SaansMono, monospace" }}>
              {loading ? "..." : new Set(filteredCards.map((c) => c.company)).size}
            </p>
          </div>
          {companyFilter.trim() && (
            <div
              style={{
                background: "rgba(0,255,100,0.08)",
                border: "1px solid rgba(0,255,100,0.2)",
                borderRadius: 8,
                padding: "16px 20px",
                flex: 1,
                minWidth: 140,
              }}
            >
              <p style={{ fontSize: 11, color: "#00FF64", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontFamily: "SaansMono, monospace" }}>
                Showing
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#00FF64", fontFamily: "Saans, sans-serif" }}>
                {companyFilter}
              </p>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: 48 }}>
            Loading...
          </p>
        ) : error ? (
          <p style={{ color: "#ff6b6b", textAlign: "center", padding: 48 }}>
            Error: {error}
          </p>
        ) : totalPlayers === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: 48 }}>
            No results found{companyFilter ? ` for "${companyFilter}"` : ""}.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sorted.map((id) => {
              const count = counts[id] || 0;
              if (count === 0 && companyFilter) return null;
              const pct = totalPlayers > 0 ? (count / totalPlayers) * 100 : 0;
              const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
              const colors = ARCHETYPE_COLORS[id] || ARCHETYPE_COLORS.vision;
              const isLeader = id === leaderId && count > 0;

              return (
                <div key={id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 80, textAlign: "right", flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "Saans, sans-serif",
                        color: isLeader ? "#00FF64" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      {ARCHETYPE_LABELS[id]}
                    </span>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 20,
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.05)",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        borderRadius: 20,
                        display: "flex",
                        alignItems: "center",
                        width: `${Math.max(barWidth, count > 0 ? 4 : 0)}%`,
                        background: isLeader
                          ? "linear-gradient(90deg, #00FF64, #00CC50)"
                          : colors.accent,
                        transition: "width 0.6s ease-out",
                      }}
                    >
                      {isLeader && (
                        <span
                          style={{
                            marginLeft: 12,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "black",
                            whiteSpace: "nowrap",
                          }}
                        >
                          IN THE LEAD
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ width: 64, textAlign: "right", flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontFamily: "SaansMono, monospace",
                        color: isLeader ? "#00FF64" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent players table */}
        {recentPlayers.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <p
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontWeight: 600,
                color: "#00FF64",
                marginBottom: 8,
                fontFamily: "SaansMono, monospace",
              }}
            >
              Recent Players{companyFilter ? ` at ${companyFilter}` : ""}
            </p>
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ textAlign: "left", padding: "10px 16px", color: "rgba(255,255,255,0.4)", fontWeight: 500, fontFamily: "SaansMono, monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Name</th>
                    <th style={{ textAlign: "left", padding: "10px 16px", color: "rgba(255,255,255,0.4)", fontWeight: 500, fontFamily: "SaansMono, monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Company</th>
                    <th style={{ textAlign: "left", padding: "10px 16px", color: "rgba(255,255,255,0.4)", fontWeight: 500, fontFamily: "SaansMono, monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Role</th>
                    <th style={{ textAlign: "left", padding: "10px 16px", color: "rgba(255,255,255,0.4)", fontWeight: 500, fontFamily: "SaansMono, monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Archetype</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPlayers.map((card) => (
                    <tr
                      key={card.userId}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <td style={{ padding: "10px 16px", fontFamily: "Saans, sans-serif" }}>
                        {card.firstName} {card.lastName}
                      </td>
                      <td style={{ padding: "10px 16px", color: "rgba(255,255,255,0.6)", fontFamily: "Saans, sans-serif" }}>
                        {card.company}
                      </td>
                      <td style={{ padding: "10px 16px", color: "rgba(255,255,255,0.6)", fontFamily: "SaansMono, monospace", fontSize: 11, textTransform: "uppercase" }}>
                        {card.role === "exec" ? "Exec" : card.role === "manager" ? "Manager" : "IC"}
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                            background: ARCHETYPE_COLORS[card.archetypeId]?.accent || "#ccc",
                            color: ARCHETYPE_COLORS[card.archetypeId]?.bg || "#000",
                            fontFamily: "SaansMono, monospace",
                          }}
                        >
                          {card.archetypeName}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
