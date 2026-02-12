"use client";

const cards = [
  { src: "/images/champion-cards/vivian.png", alt: "Vivian Hoang, Webflow" },
  { src: "/images/champion-cards/josh.png", alt: "Josh Grant, Webflow" },
  { src: "/images/champion-cards/nick.png", alt: "Nick Fairbairn, Chime" },
  { src: "/images/champion-cards/connor.png", alt: "Connor Beaulieu, LegalZoom" },
  { src: "/images/champion-cards/valeriia.png", alt: "Valeriia Frolova, Docebo" },
  { src: "/images/champion-cards/nicole.png", alt: "Lucy Hoyle, Carta" },
  { src: "/images/champion-cards/dave.png", alt: "Dave Steer, Webflow" },
];

export default function ChampionCardFan() {
  return (
    <section className="relative overflow-hidden py-8 md:py-16">
      <div
        className="flex gap-4 md:gap-6 px-6 overflow-x-auto justify-center"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>{`.card-row::-webkit-scrollbar { display: none; }`}</style>
        {cards.map((card, i) => (
          <div
            key={i}
            className="shrink-0 cursor-pointer"
            style={{
              width: "clamp(160px, 18vw, 280px)",
              transition: "transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-12px)";
              e.currentTarget.style.zIndex = "10";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.zIndex = "";
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
                borderRadius: "12px",
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
