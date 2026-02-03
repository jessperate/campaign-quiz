"use client";

export function LaurelWreath({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`laurel-glow ${className}`}
    >
      {/* Left side laurel */}
      <g opacity="0.8">
        {/* Leaves going up the left side */}
        <ellipse cx="80" cy="160" rx="15" ry="30" fill="#00ff66" transform="rotate(-20 80 160)" />
        <ellipse cx="65" cy="130" rx="14" ry="28" fill="#00ff66" transform="rotate(-35 65 130)" />
        <ellipse cx="55" cy="100" rx="13" ry="26" fill="#00ff66" transform="rotate(-50 55 100)" />
        <ellipse cx="55" cy="70" rx="12" ry="24" fill="#00ff66" transform="rotate(-65 55 70)" />
        <ellipse cx="65" cy="45" rx="11" ry="22" fill="#00ff66" transform="rotate(-80 65 45)" />
        <ellipse cx="85" cy="25" rx="10" ry="20" fill="#00ff66" transform="rotate(-95 85 25)" />
        <ellipse cx="110" cy="15" rx="10" ry="18" fill="#00ff66" transform="rotate(-110 110 15)" />
        <ellipse cx="140" cy="10" rx="10" ry="16" fill="#00ff66" transform="rotate(-120 140 10)" />
        <ellipse cx="170" cy="8" rx="10" ry="14" fill="#00ff66" transform="rotate(-130 170 8)" />

        {/* Inner leaves */}
        <ellipse cx="95" cy="145" rx="12" ry="22" fill="#00cc52" transform="rotate(-25 95 145)" />
        <ellipse cx="80" cy="115" rx="11" ry="20" fill="#00cc52" transform="rotate(-40 80 115)" />
        <ellipse cx="72" cy="85" rx="10" ry="18" fill="#00cc52" transform="rotate(-55 72 85)" />
        <ellipse cx="75" cy="58" rx="9" ry="16" fill="#00cc52" transform="rotate(-70 75 58)" />
        <ellipse cx="90" cy="38" rx="8" ry="14" fill="#00cc52" transform="rotate(-85 90 38)" />
      </g>

      {/* Right side laurel (mirrored) */}
      <g opacity="0.8">
        <ellipse cx="320" cy="160" rx="15" ry="30" fill="#00ff66" transform="rotate(20 320 160)" />
        <ellipse cx="335" cy="130" rx="14" ry="28" fill="#00ff66" transform="rotate(35 335 130)" />
        <ellipse cx="345" cy="100" rx="13" ry="26" fill="#00ff66" transform="rotate(50 345 100)" />
        <ellipse cx="345" cy="70" rx="12" ry="24" fill="#00ff66" transform="rotate(65 345 70)" />
        <ellipse cx="335" cy="45" rx="11" ry="22" fill="#00ff66" transform="rotate(80 335 45)" />
        <ellipse cx="315" cy="25" rx="10" ry="20" fill="#00ff66" transform="rotate(95 315 25)" />
        <ellipse cx="290" cy="15" rx="10" ry="18" fill="#00ff66" transform="rotate(110 290 15)" />
        <ellipse cx="260" cy="10" rx="10" ry="16" fill="#00ff66" transform="rotate(120 260 10)" />
        <ellipse cx="230" cy="8" rx="10" ry="14" fill="#00ff66" transform="rotate(130 230 8)" />

        {/* Inner leaves */}
        <ellipse cx="305" cy="145" rx="12" ry="22" fill="#00cc52" transform="rotate(25 305 145)" />
        <ellipse cx="320" cy="115" rx="11" ry="20" fill="#00cc52" transform="rotate(40 320 115)" />
        <ellipse cx="328" cy="85" rx="10" ry="18" fill="#00cc52" transform="rotate(55 328 85)" />
        <ellipse cx="325" cy="58" rx="9" ry="16" fill="#00cc52" transform="rotate(70 325 58)" />
        <ellipse cx="310" cy="38" rx="8" ry="14" fill="#00cc52" transform="rotate(85 310 38)" />
      </g>
    </svg>
  );
}
