"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Card layout matching Figma spec (node 1116:454)
// 7 cards: outer 2 are partially off-screen, 5 fully visible
// Rotations: -30, -20, -10, 0, +10, +20, +30
// Vertical offsets increase toward edges
const cards = [
  { src: "/images/champion-cards/vivian.png", alt: "Vivian Hoang, Webflow", rotate: -30, top: 280 },
  { src: "/images/champion-cards/josh.png", alt: "Josh Grant, Webflow", rotate: -20, top: 160 },
  { src: "/images/champion-cards/nick.png", alt: "Nick Fairbairn, Chime", rotate: -10, top: 40 },
  { src: "/images/champion-cards/connor.png", alt: "Connor Beaulieu, LegalZoom", rotate: 0, top: 0 },
  { src: "/images/champion-cards/valeriia.png", alt: "Valeriia Frolova, Docebo", rotate: 10, top: 40 },
  { src: "/images/champion-cards/nicole.png", alt: "Lucy Hoyle, Carta", rotate: 20, top: 160 },
  { src: "/images/champion-cards/dave.png", alt: "Dave Steer, Webflow", rotate: 30, top: 280 },
];

export default function ChampionCardFan() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollShift, setScrollShift] = useState(0);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const windowH = window.innerHeight;
    const start = windowH;
    const end = -rect.height;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
    setScrollShift((progress - 0.5) * -200);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <div
        className="relative mx-auto flex items-start justify-center"
        style={{
          height: "700px",
          padding: "3rem 0",
          transform: `translateX(${scrollShift}px)`,
        }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className="relative shrink-0 cursor-pointer"
            style={{
              width: "354px",
              marginLeft: i === 0 ? 0 : "-100px",
              marginTop: `${card.top}px`,
              transform: `rotate(${card.rotate}deg)`,
              transformOrigin: "bottom center",
              transition: "transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1)",
              zIndex: 7 - Math.abs(i - 3),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `rotate(${card.rotate}deg) translateY(-30px)`;
              e.currentTarget.style.zIndex = "10";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `rotate(${card.rotate}deg)`;
              e.currentTarget.style.zIndex = String(7 - Math.abs(i - 3));
            }}
          >
            <img
              src={card.src}
              alt={card.alt}
              draggable={false}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: "16px",
                border: "1.5px solid #00ce50",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
