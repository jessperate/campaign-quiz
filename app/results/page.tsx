"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { archetypes, getRandomBullets } from "@/lib/archetypes";
import type { Role } from "@/lib/quiz-data";

interface FormData {
  email: string;
  linkedinUrl: string;
  fullName: string;
  title: string;
  company: string;
  wantsDemo: boolean;
  headshotPreview?: string;
}

interface QuizResults {
  archetype: string;
  role: Role;
  bullets: {
    spendTime: string;
    altCareer: string;
    secretStrength: string;
  };
  formData: FormData;
}

export default function ResultsPage() {
  const [results, setResults] = useState<QuizResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check for preview mode via URL params
    const urlParams = new URLSearchParams(window.location.search);
    const previewArchetype = urlParams.get('archetype');
    const previewRole = urlParams.get('role') as Role;

    // Get quiz data from sessionStorage or URL params (for preview)
    const archetypeId = previewArchetype || sessionStorage.getItem("quizArchetype");
    const role = previewRole || sessionStorage.getItem("quizRole") as Role;
    const formDataStr = sessionStorage.getItem("quizFormData");

    console.log("Results page loaded:", { archetypeId, role, availableArchetypes: Object.keys(archetypes) });

    if (!archetypeId || !role) {
      setError("No quiz data found. Please take the quiz first.");
      return;
    }

    const archetype = archetypes[archetypeId];
    if (!archetype) {
      setError(`Unknown archetype: ${archetypeId}`);
      return;
    }

    const bullets = getRandomBullets(archetype);
    const formData: FormData = formDataStr ? JSON.parse(formDataStr) : {
      email: "",
      linkedinUrl: "",
      fullName: "Champion",
      title: "",
      company: "",
      wantsDemo: false,
    };

    setResults({
      archetype: archetypeId,
      role,
      bullets,
      formData,
    });
  }, []);

  // Show loading until mounted (avoids hydration issues)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#4ADE80] flex items-center justify-center">
        <div className="text-[#0D3D1F] text-xl" style={{ fontFamily: 'Serrif, serif' }}>
          Loading...
        </div>
      </div>
    );
  }

  // Show error with link back to quiz
  if (error) {
    return (
      <div className="min-h-screen bg-[#4ADE80] flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-[#0D3D1F] text-xl text-center" style={{ fontFamily: 'Serrif, serif' }}>
          {error}
        </div>
        <Link
          href="/quiz"
          className="px-6 py-3 bg-[#0D3D1F] text-white rounded-full font-semibold"
        >
          Take the Quiz
        </Link>
      </div>
    );
  }

  // Show loading while waiting for results
  if (!results) {
    return (
      <div className="min-h-screen bg-[#4ADE80] flex items-center justify-center">
        <div className="text-[#0D3D1F] text-xl" style={{ fontFamily: 'Serrif, serif' }}>
          Loading your results...
        </div>
      </div>
    );
  }

  const archetype = archetypes[results.archetype];
  const userName = results.formData.fullName || "Champion";
  const userTitle = results.formData.title;
  const userCompany = results.formData.company;
  const userHeadshot = results.formData.headshotPreview;

  // Role-based CTAs
  const primaryCTA = results.role === "ic"
    ? { text: "Enroll in Cohort", href: "#cohort" }
    : { text: "Book a Demo", href: "#demo" };

  // Share URLs
  const shareText = `I just discovered I'm "The ${archetype.name}" - ${archetype.tagline}. Take the quiz to find your Content Engineer archetype!`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin + '/quiz' : 'https://airops.com/win';

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="min-h-screen relative">
      {/* Full page background */}
      <div className="fixed inset-0 pointer-events-none">
        <Image
          src="/images/quiz-bg-v3.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative min-h-screen">
        <main className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Result announcement */}
            <div className="text-center mb-8 pt-16">
              <p className="text-[#0D3D1F]/70 text-lg mb-2" style={{ fontFamily: 'Serrif, serif' }}>
                Your Content Engineer Archetype
              </p>
              <h1 className="text-[#0D3D1F] text-[48px] md:text-[72px] lg:text-[88px] leading-[1] mb-4" style={{ fontFamily: 'Serrif, serif' }}>
                The {archetype.name}
              </h1>
              <p className="text-[#0D3D1F]/80 text-xl md:text-2xl italic mb-6" style={{ fontFamily: 'Serrif, serif' }}>
                "{archetype.tagline}"
              </p>
            </div>

            {/* Player Card */}
            <div className="flex justify-center mb-10">
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm">
                {/* Green header */}
                <div className="bg-[#0D3D1F] px-6 py-4 text-center">
                  <p className="text-[#4ADE80] text-xs font-bold tracking-widest uppercase">
                    {userName}&apos;s Content Team
                  </p>
                  <p className="text-white text-xl font-black tracking-tight" style={{ fontFamily: 'Knockout, sans-serif' }}>
                    WINS AI SEARCH
                  </p>
                </div>

                {/* Card body */}
                <div className="p-6">
                  {/* Headshot */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#E8F5E9] mb-4">
                    {userHeadshot ? (
                      <img
                        src={userHeadshot}
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#4ADE80]/30 to-[#4ADE80]/10">
                        <span className="text-8xl font-bold text-[#0D3D1F]/20">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User info */}
                  <div className="text-center mb-4">
                    <h3 className="text-[#0D3D1F] text-2xl font-bold">{userName}</h3>
                    {userTitle && <p className="text-[#0D3D1F]/60 text-sm">{userTitle}</p>}
                    {userCompany && <p className="text-[#0D3D1F]/60 text-sm">{userCompany}</p>}
                  </div>

                  {/* Archetype */}
                  <div className="text-center py-4 border-t border-[#E8F5E9]">
                    <p className="text-[#0D3D1F]/50 text-xs uppercase tracking-wide mb-1">Archetype</p>
                    <h4 className="text-[#0D3D1F] text-xl font-bold">The {archetype.name}</h4>
                    <p className="text-[#0D3D1F]/70 text-sm italic">&quot;{archetype.tagline}&quot;</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-[#0D3D1F] px-6 py-3 flex items-center justify-between">
                  <div className="text-white text-sm font-bold">
                    air<span className="text-[#4ADE80]">O</span>ps
                  </div>
                  <p className="text-[#4ADE80] text-xs">airops.com/win</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <p className="text-[#0D3D1F]/80 text-lg">
                {archetype.description}
              </p>
            </div>

            {/* Profile bullets */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-10">
              <h3 className="text-[#0D3D1F] text-xl font-bold mb-6 text-center" style={{ fontFamily: 'Serrif, serif' }}>
                Your Profile
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[#0D3D1F]/50 text-sm uppercase tracking-wide mb-1">
                    You spend most of your time...
                  </p>
                  <p className="text-[#0D3D1F] text-lg">{results.bullets.spendTime}</p>
                </div>
                <div>
                  <p className="text-[#0D3D1F]/50 text-sm uppercase tracking-wide mb-1">
                    In another life, you&apos;d be...
                  </p>
                  <p className="text-[#0D3D1F] text-lg">{results.bullets.altCareer}</p>
                </div>
                <div>
                  <p className="text-[#0D3D1F]/50 text-sm uppercase tracking-wide mb-1">
                    Your secret strength...
                  </p>
                  <p className="text-[#0D3D1F] text-lg">{results.bullets.secretStrength}</p>
                </div>
              </div>
            </div>

            {/* Strengths & Growth */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8">
                <h3 className="text-[#0D3D1F] text-lg font-bold mb-4" style={{ fontFamily: 'Serrif, serif' }}>
                  What you&apos;re great at
                </h3>
                <ul className="space-y-3">
                  {archetype.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[#4ADE80] mt-1">✓</span>
                      <span className="text-[#0D3D1F]/80">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8">
                <h3 className="text-[#0D3D1F] text-lg font-bold mb-4" style={{ fontFamily: 'Serrif, serif' }}>
                  Where to level up
                </h3>
                <p className="text-[#0D3D1F]/80">{archetype.growthArea}</p>
              </div>
            </div>

            {/* Recommended Resources */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 mb-10">
              <h3 className="text-[#0D3D1F] text-xl font-bold mb-6 text-center" style={{ fontFamily: 'Serrif, serif' }}>
                Recommended for You
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {archetype.resources.map((resource, i) => (
                  <a
                    key={i}
                    href={resource.url}
                    className="block p-4 rounded-2xl bg-[#E8F5E9] hover:bg-[#D1FAE5] transition-colors"
                  >
                    <p className="text-[#0D3D1F]/50 text-xs uppercase tracking-wide mb-1">
                      {resource.type}
                    </p>
                    <p className="text-[#0D3D1F] font-medium">{resource.title}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Share section */}
            <div className="text-center mb-10">
              <h3 className="text-[#0D3D1F] text-xl font-bold mb-6" style={{ fontFamily: 'Serrif, serif' }}>
                Share your results
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full font-semibold hover:bg-black/80 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Share on X
                </a>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-[#0A66C2] text-white rounded-full font-semibold hover:bg-[#0A66C2]/80 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Share on LinkedIn
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert('Link copied!');
                  }}
                  className="inline-flex items-center px-6 py-3 bg-white/80 text-[#0D3D1F] rounded-full font-semibold hover:bg-white transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pb-12">
              <a
                href={primaryCTA.href}
                className="inline-flex items-center justify-center px-8 py-4 bg-[#0D3D1F] text-white rounded-full text-lg font-bold hover:bg-[#0D3D1F]/90 transition-all"
              >
                {primaryCTA.text}
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <Link
                href="/quiz"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/80 text-[#0D3D1F] rounded-full text-lg font-bold hover:bg-white transition-colors"
              >
                Challenge Your Team
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
