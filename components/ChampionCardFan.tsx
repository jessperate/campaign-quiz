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
    <section className="relative overflow-hidden py-8 md:py-16 px-4">
      <div
        className="flex gap-3 md:gap-4 justify-center items-start max-w-[1200px] mx-auto"
      >
        {cards.map((card, i) => (
          <div
            key={i}
            className="cursor-pointer"
            style={{
              flex: "1 1 0",
              maxWidth: "160px",
              minWidth: "0",
              transition: "transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
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
                borderRadius: "8px",
                border: "1px solid #00ce50",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
