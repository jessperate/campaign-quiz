"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface CardData {
  userId: string;
  firstName: string;
  lastName: string;
  archetypeId: string;
  archetypeName: string;
  shortName: string;
  headshotUrl: string;
  company: string;
}

const ARCHETYPE_COLORS: Record<string, { bg: string; accent: string }> = {
  vision: { bg: "#002910", accent: "#DFEAE3" },
  glue: { bg: "#242603", accent: "#EEFF8C" },
  trendsetter: { bg: "#3D0A1A", accent: "#FFD6E0" },
  tastemaker: { bg: "#1A2E22", accent: "#DDE8E0" },
  goGoGoer: { bg: "#3D0A3D", accent: "#F5D6F5" },
  clutch: { bg: "#1E1A3D", accent: "#DDD3F2" },
  heart: { bg: "#0A2A3D", accent: "#CCE8F5" },
};

const ARCHETYPE_ORDER = ["vision", "glue", "trendsetter", "tastemaker", "goGoGoer", "clutch", "heart"];
const ARCHETYPE_LABELS: Record<string, string> = {
  vision: "Vision",
  glue: "Glue",
  trendsetter: "Maverick",
  tastemaker: "Craft",
  goGoGoer: "Spark",
  clutch: "Flex",
  heart: "Heart",
};

export default function HomeRecentPlayers() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/all-cards")
      .then((res) => res.json())
      .then((data) => {
        if (data.cards) {
          setCards(data.cards.slice(0, 20));
          // Count archetypes
          const c: Record<string, number> = {};
          for (const card of data.cards) {
            c[card.archetypeId] = (c[card.archetypeId] || 0) + 1;
          }
          setCounts(c);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  if (cards.length === 0) return null;

  const totalPlayers = Object.values(counts).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...Object.values(counts), 1);
  const sorted = [...ARCHETYPE_ORDER].sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
  const leaderId = sorted[0];

  return (
    <section ref={sectionRef} className="relative py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Leaderboard */}
        <div className="mb-16">
          <p
            className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-3"
            style={{ fontFamily: "SaansMono, monospace", color: "#00FF64" }}
          >
            Leaderboard
          </p>
          <h2
            className="text-white text-2xl sm:text-3xl leading-tight mb-2"
            style={{ fontFamily: "SerrifVF, Serrif, Georgia, serif" }}
          >
            Which archetype is winning?
          </h2>
          <p className="text-white/50 text-sm mb-8" style={{ fontFamily: "SaansMono, monospace" }}>
            {totalPlayers} players and counting
          </p>

          <div className="space-y-3">
            {sorted.map((id, i) => {
              const count = counts[id] || 0;
              const pct = totalPlayers > 0 ? (count / totalPlayers) * 100 : 0;
              const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
              const colors = ARCHETYPE_COLORS[id] || ARCHETYPE_COLORS.vision;
              const isLeader = id === leaderId;

              return (
                <div
                  key={id}
                  className="flex items-center gap-4"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-30px)",
                    transition: `opacity 0.5s ease-out ${i * 0.07}s, transform 0.5s ease-out ${i * 0.07}s`,
                  }}
                >
                  <div className="w-24 text-right shrink-0">
                    <span
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: "Saans, sans-serif",
                        color: isLeader ? "#00FF64" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      {ARCHETYPE_LABELS[id]}
                    </span>
                  </div>
                  <div className="flex-1 h-10 rounded-full overflow-hidden bg-white/5 relative">
                    <div
                      className="h-full rounded-full flex items-center transition-all duration-1000 ease-out"
                      style={{
                        width: visible ? `${Math.max(barWidth, 4)}%` : "0%",
                        background: isLeader
                          ? "linear-gradient(90deg, #00FF64, #00CC50)"
                          : colors.accent,
                        transitionDelay: `${i * 0.07 + 0.3}s`,
                      }}
                    >
                      {isLeader && (
                        <span className="ml-3 text-xs font-bold text-black whitespace-nowrap">
                          IN THE LEAD
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-16 text-right shrink-0">
                    <span
                      className="text-xs tabular-nums"
                      style={{
                        fontFamily: "SaansMono, monospace",
                        color: isLeader ? "#00FF64" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Players */}
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-3"
            style={{ fontFamily: "SaansMono, monospace", color: "#00FF64" }}
          >
            Recent Players
          </p>
          <h2
            className="text-white text-2xl sm:text-3xl leading-tight mb-8"
            style={{ fontFamily: "SerrifVF, Serrif, Georgia, serif" }}
          >
            See who else is playing
          </h2>
        </div>
      </div>

      {/* Scrollable card row */}
      <div
        className="flex gap-4 px-6 overflow-x-auto pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`.home-gallery::-webkit-scrollbar { display: none; }`}</style>
        {cards.map((card, i) => {
          const colors = ARCHETYPE_COLORS[card.archetypeId] || ARCHETYPE_COLORS.vision;
          return (
            <Link
              key={card.userId}
              href={`/results?userId=${card.userId}`}
              className="group flex-shrink-0"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 0.5s ease-out ${i * 0.06 + 0.5}s, transform 0.5s ease-out ${i * 0.06 + 0.5}s`,
              }}
            >
              <div
                className="relative rounded-xl overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  width: "160px",
                  height: "200px",
                  background: colors.bg,
                }}
              >
                {/* Headshot */}
                {card.headshotUrl ? (
                  <img
                    src={card.headshotUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: colors.bg }}
                  >
                    <img
                      src="/images/smiley-fallback.svg"
                      alt=""
                      className="w-16 h-16 opacity-30"
                    />
                  </div>
                )}

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, ${colors.bg} 0%, ${colors.bg}CC 30%, transparent 70%)`,
                  }}
                />

                {/* Card info */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div
                    className="text-[10px] uppercase tracking-wider mb-1 font-semibold"
                    style={{ fontFamily: "SaansMono, monospace", color: colors.accent }}
                  >
                    {card.shortName}
                  </div>
                  <div
                    className="text-white text-sm font-medium leading-tight truncate"
                    style={{ fontFamily: "Saans, sans-serif" }}
                  >
                    {card.firstName} {card.lastName}
                  </div>
                  {card.company && (
                    <div className="text-white/40 text-[11px] truncate mt-0.5">
                      {card.company}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {/* CTA card */}
        <Link
          href="/quiz"
          className="flex-shrink-0"
          style={{
            opacity: visible ? 1 : 0,
            transition: `opacity 0.5s ease-out ${cards.length * 0.06 + 0.5}s`,
          }}
        >
          <div
            className="rounded-xl overflow-hidden flex items-center justify-center transition-transform duration-300 hover:scale-105 border border-[#00FF64]/30"
            style={{
              width: "160px",
              height: "200px",
              background: "rgba(0,255,100,0.05)",
            }}
          >
            <div className="text-center px-4">
              <div className="text-[#00FF64] text-2xl mb-2">+</div>
              <div
                className="text-[#00FF64] text-xs font-semibold uppercase tracking-wider"
                style={{ fontFamily: "SaansMono, monospace" }}
              >
                Get your card
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
