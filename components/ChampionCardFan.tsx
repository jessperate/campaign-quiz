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
        className="card-fan"
        style={{ transform: `translateX(${scrollShift}px)` }}
      >
        {cards.map((card, i) => (
          <div key={i} className="card" tabIndex={0}>
            <Image
              src={card.src}
              alt={card.alt}
              fill
              className="object-cover"
              sizes="280px"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
