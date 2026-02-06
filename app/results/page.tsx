"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import html2canvas from "html2canvas";
import { archetypes, getRandomBullets } from "@/lib/archetypes";
import type { Role, ArchetypeId } from "@/lib/quiz-data";
import { ShareCard } from "@/components/Results/ShareCard";

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
  archetype: ArchetypeId;
  role: Role;
  bullets: {
    mostLikelyTo: string;
    typicallySpending: string;
    favoritePhrase: string;
  };
  formData: FormData;
}

export default function ResultsPage() {
  const [results, setResults] = useState<QuizResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stippleImage, setStippleImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [shareableCardUrl, setShareableCardUrl] = useState<string | null>(null);
  const [isCapturingCard, setIsCapturingCard] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const generateCardImage = async (resultsData: QuizResults) => {
    setIsGeneratingImage(true);
    setImageError(null);

    try {
      const archetype = archetypes[resultsData.archetype];
      const photoData = resultsData.formData.headshotPreview || null;

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoBase64: photoData,
          userName: resultsData.formData.fullName || 'Champion',
          archetype: archetype.name,
          tagline: archetype.roleContent[resultsData.role].tagline,
        }),
      });

      const data = await response.json();

      if (data.imageUrl) {
        setStippleImage(data.imageUrl);
      } else {
        setImageError(data.error || 'Failed to generate image');
      }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Capture and upload the card for sharing
  const captureAndUploadCard = useCallback(async () => {
    if (!cardRef.current || shareableCardUrl || isCapturingCard) return;

    setIsCapturingCard(true);
    try {
      // Wait for images to fully render
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(cardRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        width: 1080,
        height: 1080,
      });

      const imageBase64 = canvas.toDataURL('image/png');
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch('/api/upload-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, uniqueId }),
      });

      const data = await response.json();
      if (data.url) {
        setShareableCardUrl(data.url);
        console.log('Card uploaded:', data.url);
      }
    } catch (err) {
      console.error('Failed to capture/upload card:', err);
    } finally {
      setIsCapturingCard(false);
    }
  }, [shareableCardUrl, isCapturingCard]);

  // Trigger card capture when stipple image is ready
  useEffect(() => {
    if (stippleImage && !shareableCardUrl && !isCapturingCard) {
      const timer = setTimeout(() => {
        captureAndUploadCard();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stippleImage, shareableCardUrl, isCapturingCard, captureAndUploadCard]);

  useEffect(() => {
    // Get URL params for preview mode
    const urlParams = new URLSearchParams(window.location.search);
    const previewArchetype = urlParams.get('archetype');
    const previewRole = urlParams.get('role') as Role;

    // Get data from URL params or sessionStorage
    const archetypeId = (previewArchetype || sessionStorage.getItem("quizArchetype")) as ArchetypeId;
    const role = previewRole || sessionStorage.getItem("quizRole") as Role;
    const formDataStr = sessionStorage.getItem("quizFormData");

    if (!archetypeId || !role) {
      setError("No quiz data found. Please take the quiz first.");
      return;
    }

    const archetype = archetypes[archetypeId];
    if (!archetype) {
      setError(`Unknown archetype: ${archetypeId}`);
      return;
    }

    const bullets = getRandomBullets(archetype, role);
    const formData: FormData = formDataStr ? JSON.parse(formDataStr) : {
      email: "",
      linkedinUrl: "",
      fullName: "Champion",
      title: "",
      company: "",
      wantsDemo: false,
    };

    const newResults = {
      archetype: archetypeId,
      role,
      bullets,
      formData,
    };
    setResults(newResults);

    // Auto-generate the card image with Nano Banana Pro
    generateCardImage(newResults);
  }, []);

  // Error state
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

  // Loading state
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
  const roleContent = archetype.roleContent[results.role];
  const userName = results.formData.fullName || "Champion";
  const userCompany = results.formData.company || "";

  // Parse name into first/last
  const nameParts = userName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Role-based CTAs
  const primaryCTA = results.role === "ic"
    ? { text: "Enroll in Cohort", href: "#cohort" }
    : { text: "Book a Demo", href: "#demo" };

  // Share URLs
  const shareText = `I just discovered I'm "The ${archetype.name}" - ${roleContent.tagline}. Take the quiz to find your Content Engineer archetype!`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin + '/quiz' : 'https://airops.com/win';
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  // Build LinkedIn share URL with OG meta tags via share page
  const buildLinkedInShareUrl = () => {
    if (typeof window === 'undefined') return 'https://www.linkedin.com/sharing/share-offsite/?url=https://airops.com/win';

    const baseUrl = window.location.origin;
    const sharePageUrl = new URL('/share', baseUrl);
    sharePageUrl.searchParams.set('archetype', results.archetype);
    if (shareableCardUrl) {
      sharePageUrl.searchParams.set('cardUrl', shareableCardUrl);
    }
    sharePageUrl.searchParams.set('stat1', results.bullets.mostLikelyTo);
    sharePageUrl.searchParams.set('stat2', results.bullets.typicallySpending);
    sharePageUrl.searchParams.set('stat3', results.bullets.favoritePhrase);

    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sharePageUrl.toString())}`;
  };
  const linkedinUrl = buildLinkedInShareUrl();

  return (
    <div className="min-h-screen relative">
      {/* Background */}
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
                &quot;{roleContent.tagline}&quot;
              </p>
            </div>

            {/* Share Card - rendered at 1080x1080 but displayed scaled */}
            <div className="flex flex-col items-center mb-10">
              {/* Hidden full-size card for html2canvas capture */}
              <div
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  top: 0,
                }}
              >
                <ShareCard
                  ref={cardRef}
                  firstName={firstName}
                  lastName={lastName}
                  company={userCompany}
                  archetypeName={archetype.name}
                  shortName={archetype.shortName}
                  headshotUrl={stippleImage || results.formData.headshotPreview}
                  mostLikelyTo={results.bullets.mostLikelyTo}
                  typicallySpending={results.bullets.typicallySpending}
                  favoritePhrase={results.bullets.favoritePhrase}
                />
              </div>

              {/* Visible scaled-down card */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  aspectRatio: '1',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                }}
              >
                <div
                  style={{
                    width: '1080px',
                    height: '1080px',
                    transform: 'scale(0.37)',
                    transformOrigin: 'top left',
                  }}
                >
                  <ShareCard
                    firstName={firstName}
                    lastName={lastName}
                    company={userCompany}
                    archetypeName={archetype.name}
                    shortName={archetype.shortName}
                    headshotUrl={stippleImage || results.formData.headshotPreview}
                    mostLikelyTo={results.bullets.mostLikelyTo}
                    typicallySpending={results.bullets.typicallySpending}
                    favoritePhrase={results.bullets.favoritePhrase}
                  />
                </div>
              </div>

              {/* Loading indicator */}
              {isGeneratingImage && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 text-[#0D3D1F]/60">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">Creating your stipple portrait...</span>
                  </div>
                </div>
              )}

              {/* Regenerate button (only show if there was an error) */}
              {imageError && (
                <div className="mt-4 text-center">
                  <p className="text-red-600 text-sm mb-2">{imageError}</p>
                  <button
                    onClick={() => results && generateCardImage(results)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D3D1F] text-white rounded-full text-sm font-semibold hover:bg-[#0D3D1F]/90 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <p className="text-[#0D3D1F]/80 text-lg">
                {roleContent.description}
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
                    Most likely to...
                  </p>
                  <p className="text-[#0D3D1F] text-lg">{results.bullets.mostLikelyTo}</p>
                </div>
                <div>
                  <p className="text-[#0D3D1F]/50 text-sm uppercase tracking-wide mb-1">
                    Typically spending time...
                  </p>
                  <p className="text-[#0D3D1F] text-lg">{results.bullets.typicallySpending}</p>
                </div>
                <div>
                  <p className="text-[#0D3D1F]/50 text-sm uppercase tracking-wide mb-1">
                    Favorite phrase...
                  </p>
                  <p className="text-[#0D3D1F] text-lg">{results.bullets.favoritePhrase}</p>
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
                {/* Download Card Button */}
                {shareableCardUrl ? (
                  <a
                    href={shareableCardUrl}
                    download={`${userName.replace(/\s+/g, '-')}-player-card.png`}
                    className="inline-flex items-center px-6 py-3 bg-[#22C55E] text-white rounded-full font-semibold hover:bg-[#16A34A] transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Card
                  </a>
                ) : isCapturingCard ? (
                  <div className="inline-flex items-center px-6 py-3 bg-[#E8F5E9] text-[#0D3D1F]/60 rounded-full font-semibold">
                    <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Preparing card...
                  </div>
                ) : null}
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
                {shareableCardUrl ? (
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
                ) : (
                  <div className="inline-flex items-center px-6 py-3 bg-[#0A66C2]/50 text-white/70 rounded-full font-semibold cursor-not-allowed">
                    <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Preparing...
                  </div>
                )}
                <button
                  onClick={() => {
                    // Build personalized share URL
                    const baseUrl = window.location.origin;
                    const sharePageUrl = new URL('/share', baseUrl);
                    sharePageUrl.searchParams.set('archetype', results.archetype);
                    if (shareableCardUrl) {
                      sharePageUrl.searchParams.set('cardUrl', shareableCardUrl);
                    }
                    sharePageUrl.searchParams.set('stat1', results.bullets.mostLikelyTo);
                    sharePageUrl.searchParams.set('stat2', results.bullets.typicallySpending);
                    sharePageUrl.searchParams.set('stat3', results.bullets.favoritePhrase);
                    navigator.clipboard.writeText(sharePageUrl.toString());
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
