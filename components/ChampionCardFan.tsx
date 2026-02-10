"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const cards = [
  { src: "/images/champion-cards/vivian.png", alt: "Vivian Hoang, Webflow" },
  { src: "/images/champion-cards/connor.png", alt: "Connor Beaulieu, LegalZoom" },
  { src: "/images/champion-cards/nick.png", alt: "Nick Fairbairn, Chime" },
  { src: "/images/champion-cards/valeriia.png", alt: "Valeriia Frolova, Docebo" },
  { src: "/images/champion-cards/josh.png", alt: "Josh Grant, Webflow" },
  { src: "/images/champion-cards/nicole.png", alt: "Lucy Hoyle, Carta" },
  { src: "/images/champion-cards/dave.png", alt: "Dave Steer, Webflow" },
];

// Fan layout: rotation and vertical offset for each card position
// Center card (index 3) is upright, outer cards fan out
const fanConfig = [
  { rotate: -18, yOffset: 60 },
  { rotate: -12, yOffset: 30 },
  { rotate: -6, yOffset: 10 },
  { rotate: 0, yOffset: 0 },
  { rotate: 6, yOffset: 10 },
  { rotate: 12, yOffset: 30 },
  { rotate: 18, yOffset: 60 },
];

export default function ChampionCardFan() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Progress goes from 0 (section enters viewport) to 1 (section leaves)
    const start = windowH;
    const end = -rect.height;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Scroll-driven horizontal shift: cards slide left as user scrolls
  const scrollShift = (scrollProgress - 0.5) * -200;

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 overflow-hidden"
    >
      <div
        className="flex items-end justify-center gap-[-20px]"
        style={{
          transform: `translateX(${scrollShift}px)`,
          transition: "transform 0.1s linear",
        }}
      >
        {cards.map((card, i) => {
          const config = fanConfig[i];
          const isHovered = hoveredIndex === i;

          return (
            <div
              key={i}
              className="relative shrink-0 cursor-pointer"
              style={{
                width: "280px",
                marginLeft: i === 0 ? 0 : "-40px",
                zIndex: isHovered ? 20 : 10 - Math.abs(i - 3),
                transform: `rotate(${config.rotate}deg) translateY(${isHovered ? config.yOffset - 30 : config.yOffset}px)`,
                transition: "transform 0.3s ease-out, z-index 0s",
                transformOrigin: "bottom center",
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Image
                src={card.src}
                alt={card.alt}
                width={560}
                height={780}
                className="w-full h-auto rounded-2xl"
                style={{
                  filter: isHovered
                    ? "drop-shadow(0 -10px 30px rgba(0,255,100,0.2))"
                    : "drop-shadow(0 10px 30px rgba(0,0,0,0.4))",
                  transition: "filter 0.3s ease-out",
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
