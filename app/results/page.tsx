"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/ui/Header";
import { PlayerCard } from "@/components/Results/PlayerCard";
import { LaurelWreath } from "@/components/LaurelWreath";
import { archetypes, getRandomBullets } from "@/lib/archetypes";
import type { Role } from "@/lib/quiz-data";

interface QuizResults {
  archetype: string;
  role: Role;
  bullets: {
    spendTime: string;
    altCareer: string;
    secretStrength: string;
  };
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Get quiz data from sessionStorage
    const archetypeId = sessionStorage.getItem("quizArchetype");
    const role = sessionStorage.getItem("quizRole") as Role;

    if (!archetypeId || !role) {
      // No quiz data, redirect to quiz
      router.push("/quiz");
      return;
    }

    const archetype = archetypes[archetypeId];
    if (!archetype) {
      router.push("/quiz");
      return;
    }

    const bullets = getRandomBullets(archetype);
    setResults({
      archetype: archetypeId,
      role,
      bullets,
    });

    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [router]);

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading your results...</div>
      </div>
    );
  }

  const archetype = archetypes[results.archetype];

  // Role-based CTAs
  const primaryCTA = {
    ic: { text: "Join the Content Engineering Cohort", href: "#cohort" },
    manager: { text: "Book a Demo", href: "#demo" },
    executive: { text: "Book a Demo", href: "#demo" },
  }[results.role];

  const secondaryCTA = {
    ic: { text: "Explore AirOps", href: "https://airops.com" },
    manager: { text: "Join the Content Engineering Cohort", href: "#cohort" },
    executive: { text: "See Customer Stories", href: "#cases" },
  }[results.role];

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      {/* Confetti animation placeholder */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* Add confetti library here later */}
        </div>
      )}

      {/* Background decoration */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <LaurelWreath className="w-[1000px] h-[500px]" />
      </div>

      <main className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Result announcement */}
          <div className="text-center mb-12">
            <p className="text-green text-sm uppercase tracking-widest mb-2">
              Your Content Engineer Archetype
            </p>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4">
              The {archetype.name}
            </h1>
            <p className="text-2xl text-green italic mb-6">
              &quot;{archetype.tagline}&quot;
            </p>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              {archetype.description}
            </p>
          </div>

          {/* Player Card */}
          <div className="flex justify-center mb-12">
            <PlayerCard
              name="Your Name"
              archetype={archetype.name}
              tagline={archetype.tagline}
              className="transform hover:scale-105 transition-transform"
            />
          </div>

          {/* Personalized bullets */}
          <div className="bg-card-bg border border-card-border rounded-2xl p-8 mb-12">
            <h3 className="text-xl font-bold text-white mb-6">Your Profile</h3>
            <div className="space-y-4">
              <div>
                <p className="text-green text-sm uppercase tracking-wide mb-1">
                  You spend most of your time...
                </p>
                <p className="text-white text-lg">{results.bullets.spendTime}</p>
              </div>
              <div>
                <p className="text-green text-sm uppercase tracking-wide mb-1">
                  In another life, you&apos;d be...
                </p>
                <p className="text-white text-lg">{results.bullets.altCareer}</p>
              </div>
              <div>
                <p className="text-green text-sm uppercase tracking-wide mb-1">
                  Your secret strength...
                </p>
                <p className="text-white text-lg">{results.bullets.secretStrength}</p>
              </div>
            </div>
          </div>

          {/* Share section */}
          <div className="text-center mb-12">
            <h3 className="text-xl font-bold text-white mb-6">Share your results</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="inline-flex items-center px-6 py-3 bg-[#1DA1F2] text-white rounded-full font-semibold hover:bg-[#1DA1F2]/80 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-[#0A66C2] text-white rounded-full font-semibold hover:bg-[#0A66C2]/80 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Share on LinkedIn
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-card-bg border border-card-border text-white rounded-full font-semibold hover:bg-card-border transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Card
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-card-bg border border-card-border text-white rounded-full font-semibold hover:bg-card-border transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={primaryCTA.href}
              className="inline-flex items-center justify-center px-8 py-4 bg-green text-black rounded-full text-lg font-bold hover:bg-green-dark transition-all btn-glow"
            >
              {primaryCTA.text}
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href={secondaryCTA.href}
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-green text-green rounded-full text-lg font-bold hover:bg-green/10 transition-colors"
            >
              {secondaryCTA.text}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
