"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ShareCard } from "@/components/Results/ShareCard";
import type { ArchetypeId } from "@/lib/quiz-data";

interface CardData {
  userId: string;
  firstName: string;
  lastName: string;
  archetypeId: string;
  archetypeName: string;
  shortName: string;
  headshotUrl: string;
  stippleImageUrl: string;
  company: string;
  mostLikelyTo: string;
  typicallySpending: string;
  favoritePhrase: string;
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

// The inner card within the 1080x1080 ShareCard canvas
const CARD_LEFT = 220;
const CARD_TOP = 77;
const CARD_W = 641;
const CARD_H = 926;
const CANVAS = 1080;

// Display size for cards in the horizontal scroll
const DISPLAY_W = 200;
const DISPLAY_H = Math.round(DISPLAY_W * (CARD_H / CARD_W)); // ~289

function HomeHoloCard({
  card,
  visible,
  delay,
}: {
  card: CardData;
  visible: boolean;
  delay: number;
}) {
  const [tilt, setTilt] = useState({ rX: 0, rY: 0, pX: 0, pY: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const scale = DISPLAY_W / CARD_W;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rY: (x - 0.5) * 24,
      rX: -(y - 0.5) * 24,
      pX: Math.max(-1, Math.min(1, (x - 0.5) * 2)),
      pY: Math.max(-1, Math.min(1, (y - 0.5) * 2)),
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setTilt({ rX: 0, rY: 0, pX: 0, pY: 0 });
  }, []);

  return (
    <Link
      href={`/results?userId=${card.userId}`}
      className="flex-shrink-0 block"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`,
      }}
    >
      <div
        style={{ perspective: "800px", transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={wrapperRef}
          className="rounded-lg overflow-hidden"
          style={{
            position: "relative",
            width: `${DISPLAY_W}px`,
            height: `${DISPLAY_H}px`,
            transform: `rotateX(${tilt.rX}deg) rotateY(${tilt.rY}deg)`,
            transition: isHovering
              ? "transform 0.1s ease-out"
              : "transform 0.6s ease-out",
            transformStyle: "preserve-3d",
            boxShadow: isHovering
              ? `${-tilt.rY * 1.2}px ${tilt.rX * 1.2}px 30px rgba(0,0,0,0.35)`
              : "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          {/* ShareCard rendered at full 1080x1080, scaled + offset to show inner card */}
          <div
            style={{
              position: "absolute",
              width: `${CANVAS}px`,
              height: `${CANVAS}px`,
              transform: `scale(${scale})`,
              transformOrigin: "0 0",
              left: `${-CARD_LEFT * scale}px`,
              top: `${-CARD_TOP * scale}px`,
            }}
          >
            <ShareCard
              firstName={card.firstName}
              lastName={card.lastName}
              company={card.company}
              archetypeName={card.archetypeName}
              shortName={card.shortName}
              archetypeId={card.archetypeId as ArchetypeId}
              headshotUrl={card.stippleImageUrl || card.headshotUrl}
              mostLikelyTo={card.mostLikelyTo}
              typicallySpending={card.typicallySpending}
              favoritePhrase={card.favoritePhrase}
              transparent
            />
          </div>

          {/* Holographic pattern layer */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              overflow: "hidden",
              mixBlendMode: "multiply",
              opacity: isHovering ? 0.45 : 0,
              transition: "opacity 0.3s ease-out",
              maskImage:
                'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\'%3E%3Crect width=\'4\' height=\'4\' fill=\'white\'/%3E%3Crect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'white\'/%3E%3C/svg%3E")',
              maskSize: "5px 5px",
              WebkitMaskImage:
                'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\'%3E%3Crect width=\'4\' height=\'4\' fill=\'white\'/%3E%3Crect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'white\'/%3E%3C/svg%3E")',
              WebkitMaskSize: "5px 5px",
              filter: "saturate(2)",
              zIndex: 5,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "500%",
                aspectRatio: "1",
                bottom: 0,
                left: 0,
                transformOrigin: "0 100%",
                background:
                  "radial-gradient(circle at 0 100%, transparent 10%, hsl(5,100%,80%), hsl(150,100%,60%), hsl(220,90%,70%), transparent 60%)",
                scale: `${Math.min(1, 0.15 + tilt.pX * 0.25)}`,
                translate: `${Math.max(-10, Math.min(10, -10 + tilt.pX * 10))}% ${Math.max(0, tilt.pY * -10)}%`,
                transition: !isHovering ? "all 0.3s ease-out" : "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "500%",
                aspectRatio: "1",
                top: 0,
                right: 0,
                transformOrigin: "100% 0",
                background:
                  "radial-gradient(circle at 100% 0, transparent 10%, hsl(5,100%,80%), hsl(150,100%,60%), hsl(220,90%,70%), transparent 60%)",
                scale: `${Math.min(1, 0.15 + tilt.pX * -0.65)}`,
                translate: `${Math.max(-10, Math.min(10, 10 + tilt.pX * 10))}% ${Math.min(0, tilt.pY * -10)}%`,
                transition: !isHovering ? "all 0.3s ease-out" : "none",
              }}
            />
          </div>

          {/* Watermark holographic layer */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              overflow: "hidden",
              mixBlendMode: "hard-light",
              opacity: isHovering ? 0.35 : 0,
              transition: "opacity 0.3s ease-out",
              maskImage:
                "repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)",
              maskSize: "10px 10px",
              WebkitMaskImage:
                "repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)",
              WebkitMaskSize: "10px 10px",
              filter: "saturate(0.9) contrast(1.1) brightness(1.2)",
              zIndex: 6,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "500%",
                aspectRatio: "1",
                bottom: 0,
                left: 0,
                transformOrigin: "0 100%",
                background:
                  "radial-gradient(circle at 0 100%, transparent 10%, hsl(5,100%,80%), hsl(150,100%,60%), hsl(220,90%,70%), transparent 60%)",
                scale: `${Math.min(1, 0.15 + tilt.pX * 0.25)}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "500%",
                aspectRatio: "1",
                top: 0,
                right: 0,
                transformOrigin: "100% 0",
                background:
                  "radial-gradient(circle at 100% 0, transparent 10%, hsl(5,100%,80%), hsl(150,100%,60%), hsl(220,90%,70%), transparent 60%)",
                scale: `${Math.min(1, 0.15 + tilt.pX * -0.65)}`,
              }}
            />
          </div>

          {/* Spotlight */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              overflow: "hidden",
              mixBlendMode: "overlay",
              zIndex: 8,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "500%",
                aspectRatio: "1",
                background:
                  "radial-gradient(hsl(0 0% 100% / 0.4) 0 2%, hsl(0 0% 10% / 0.2) 20%)",
                filter: "brightness(1.2) contrast(1.2)",
                translate: `calc(-50% + ${tilt.pX * 20}%) calc(-50% + ${tilt.pY * 20}%)`,
                opacity: isHovering ? 1 : 0,
                transition: !isHovering
                  ? "opacity 0.3s ease-out, translate 0.3s ease-out"
                  : "none",
              }}
            />
          </div>

          {/* Edge glare */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              opacity: isHovering ? 0.15 : 0,
              transition: "opacity 0.3s ease-out",
              background:
                "linear-gradient(-65deg, transparent 0% 40%, #fff 40% 50%, transparent 50%, transparent 55%, #fff 55% 60%, transparent 60% 100%)",
              zIndex: 9,
            }}
          />
        </div>
      </div>
    </Link>
  );
}

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
          const c: Record<string, number> = {};
          for (const card of data.cards) {
            c[card.archetypeId] = (c[card.archetypeId] || 0) + 1;
          }
          setCounts(c);
        }
      })
      .catch(() => {});
  }, []);

  // Use callback ref so the observer attaches when the DOM node appears
  const observerRef = useRef<IntersectionObserver | null>(null);
  const setRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    if (node) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setVisible(true); },
        { threshold: 0.05 }
      );
      observerRef.current.observe(node);
    }
    sectionRef.current = node;
  }, []);

  if (cards.length === 0) return null;

  const totalPlayers = Object.values(counts).reduce((a, b) => a + b, 0);
  const maxCount = Math.max(...Object.values(counts), 1);
  const sorted = [...ARCHETYPE_ORDER].sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
  const leaderId = sorted[0];

  return (
    <section ref={setRef} className="relative py-16 md:py-24">
      {/* Recent Players first */}
      <div className="max-w-6xl mx-auto px-6 mb-6">
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

      {/* Auto-scrolling marquee of cards */}
      <div className="overflow-hidden" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.5s ease-out" }}>
        <style>{`
          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            gap: 20px;
            width: max-content;
            animation: marquee-scroll 40s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="marquee-track">
          {/* Render cards twice for seamless loop */}
          {[...cards, ...cards].map((card, i) => (
            <HomeHoloCard
              key={`${card.userId}-${i}`}
              card={card}
              visible={visible}
              delay={0}
            />
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-6xl mx-auto px-6 mt-16">
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
                  transition: `opacity 0.5s ease-out ${i * 0.07 + 0.4}s, transform 0.5s ease-out ${i * 0.07 + 0.4}s`,
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
                      transitionDelay: `${i * 0.07 + 0.6}s`,
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
    </section>
  );
}
