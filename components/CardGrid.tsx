"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ShareCard } from "@/components/Results/ShareCard";
import type { ArchetypeId } from "@/lib/quiz-data";

interface CardEntry {
  userId: string;
  firstName: string;
  lastName: string;
  company: string;
  archetypeId: string;
  archetypeName: string;
  shortName: string;
  headshotUrl: string;
  stippleImageUrl: string;
  mostLikelyTo: string;
  typicallySpending: string;
  favoritePhrase: string;
  createdAt: string;
}

// The inner card within the 1080x1080 ShareCard canvas
const CARD_LEFT = 220;
const CARD_TOP = 77;
const CARD_W = 641;
const CARD_H = 926;
const CANVAS = 1080;

function HoloCard({
  card,
  isRevealed,
  rotation,
  cardRef,
}: {
  card: CardEntry;
  isRevealed: boolean;
  rotation: number;
  cardRef: (node: HTMLAnchorElement | null) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [tilt, setTilt] = useState({ rX: 0, rY: 0, pX: 0, pY: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Measure container and compute scale so the 641px card fills the width
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0) setScale(w / CARD_W);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
      ref={cardRef}
      data-card-id={card.userId}
      href={`/share?userId=${card.userId}`}
      className="block"
      style={{
        breakInside: "avoid",
        marginBottom: 20,
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed
          ? "scale(1) rotate(0deg) translateY(0)"
          : `scale(0.85) rotate(${rotation}deg) translateY(40px)`,
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
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
            width: "100%",
            aspectRatio: `${CARD_W} / ${CARD_H}`,
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
          {/* ShareCard rendered at full 1080x1080, scaled + offset to show only the inner card */}
          {scale > 0 && (
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
          )}

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

export default function CardGrid() {
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    fetch("/api/all-cards")
      .then((res) => res.json())
      .then((data) => {
        setCards(data.cards || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cardRef = useCallback(
    (node: HTMLAnchorElement | null) => {
      if (!node) return;
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const id = (entry.target as HTMLElement).dataset.cardId;
                if (id) {
                  setRevealed((prev) => new Set(prev).add(id));
                  observerRef.current?.unobserve(entry.target);
                }
              }
            });
          },
          { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );
      }
      observerRef.current.observe(node);
    },
    []
  );

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  if (loading) {
    return (
      <section className="relative py-12 px-6">
        <div
          className="max-w-7xl mx-auto"
          style={{ columns: 2, columnGap: 20 }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-lg bg-white/5 animate-pulse"
              style={{
                breakInside: "avoid",
                marginBottom: 20,
                aspectRatio: `${CARD_W} / ${CARD_H}`,
              }}
            />
          ))}
        </div>
      </section>
    );
  }

  if (cards.length === 0) return null;

  return (
    <section className="relative py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <p
          className="text-[#00FF64]/60 text-[14px] mb-8 uppercase tracking-[0.2em]"
          style={{ fontFamily: "SaansMono, monospace" }}
        >
          Recent players
        </p>

        <div className="masonry-grid">
          {cards.map((card, i) => {
            const isRevealed = revealed.has(card.userId);
            const side = i % 2 === 0 ? 1 : -1;
            const amp = (i % 3) + 1;
            const rotation = side * 5 * amp;

            return (
              <HoloCard
                key={card.userId}
                card={card}
                isRevealed={isRevealed}
                rotation={rotation}
                cardRef={cardRef}
              />
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .masonry-grid {
          columns: 2;
          column-gap: 20px;
        }
        @media (min-width: 640px) {
          .masonry-grid { columns: 3; }
        }
        @media (min-width: 1024px) {
          .masonry-grid { columns: 4; }
        }
        @media (min-width: 1280px) {
          .masonry-grid { columns: 5; }
        }
      `}</style>
    </section>
  );
}
