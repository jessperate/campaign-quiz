"use client";

import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <AirOpsLogo />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="https://airops.com/start-free-trial"
            className="text-white hover:text-green transition-colors text-sm font-medium"
          >
            Start Free Trial
          </Link>
          <Link
            href="https://airops.com/demo"
            className="inline-flex items-center px-4 py-2 bg-green text-black rounded-full text-sm font-semibold hover:bg-green-dark transition-colors"
          >
            Book a Demo
            <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}

function AirOpsLogo() {
  return (
    <svg width="100" height="28" viewBox="0 0 100 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="22" fill="white" fontSize="24" fontWeight="bold" fontFamily="system-ui, sans-serif">
        air<tspan fill="#00ff66">O</tspan>ps
      </text>
    </svg>
  );
}
