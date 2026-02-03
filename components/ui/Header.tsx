"use client";

import Image from "next/image";

export function Header() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <Image
        src="/images/nav-bar.svg"
        alt="AirOps Navigation"
        width={1344}
        height={88}
        className="w-auto h-[60px] md:h-[70px] lg:h-[88px] max-w-full pointer-events-auto"
        priority
      />
    </header>
  );
}
