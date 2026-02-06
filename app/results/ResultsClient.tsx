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
  headshotUrl?: string;
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

export default function ResultsClient() {
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
          photoUrl: resultsData.formData.headshotUrl || null,
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

        // Save card URL to Redis for OG image
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        if (userId) {
          fetch('/api/save-card-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, cardUrl: data.url }),
          }).catch(() => {});
        }
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
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    // If userId is in the URL, fetch results from the API
    if (userId) {
      fetch(`/api/get-results?userId=${encodeURIComponent(userId)}`)
        .then(res => res.json())
        .then(async (data) => {
          if (!data.success) {
            setError(data.error || "Failed to load results.");
            return;
          }

          let resultData = data;

          // If linkedinUrl is present but enrichment hasn't happened yet, trigger it
          if (data.linkedinUrl && !data.enriched) {
            try {
              const enrichRes = await fetch('/api/enrich-linkedin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, linkedinUrl: data.linkedinUrl }),
              });
              const enrichData = await enrichRes.json();
              if (enrichData.success) {
                resultData = enrichData;
              }
            } catch (err) {
              console.warn("LinkedIn enrichment failed, using original data:", err);
            }
          }

          const archetypeId = resultData.archetype.id as ArchetypeId;
          const role = resultData.role as Role;

          const newResults: QuizResults = {
            archetype: archetypeId,
            role,
            bullets: resultData.bullets,
            formData: {
              email: resultData.email || "",
              linkedinUrl: resultData.linkedinUrl || "",
              fullName: `${resultData.firstName || ""} ${resultData.lastName || ""}`.trim(),
              title: "",
              company: resultData.company || "",
              wantsDemo: false,
              headshotUrl: resultData.headshotUrl || "",
            },
          };
          setResults(newResults);
          generateCardImage(newResults);
        })
        .catch(() => {
          setError("Failed to load results. Please try again.");
        });
      return;
    }

    // Fallback: get data from URL params (preview mode) or sessionStorage (in-app quiz)
    const previewArchetype = urlParams.get('archetype');
    const previewRole = urlParams.get('role') as Role;

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
      {/* Hero section with background image */}
      <div
        className="relative w-full"
        style={{
          height: '1130px',
          backgroundImage: 'url(/results-hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Archetype header SVG anchored to top */}
        <div className="w-full">
          <img
            src={`/headers/the-${archetype.id}-header.svg`}
            alt={`The ${archetype.name}`}
            className="w-full h-auto"
          />
        </div>

        {/* Share Card - rendered at 1080x1080 but displayed scaled */}
        <div className="flex flex-col items-center px-6">
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
              archetypeId={results.archetype}
              headshotUrl={stippleImage || results.formData.headshotPreview}
              mostLikelyTo={results.bullets.mostLikelyTo}
              typicallySpending={results.bullets.typicallySpending}
              favoritePhrase={results.bullets.favoritePhrase}
            />
          </div>

          {/* Card + Share button wrapper (same width) */}
          <div style={{ width: '100%', maxWidth: '560px' }}>
            {/* Visible scaled-down card */}
            <div
              style={{
                width: '100%',
                aspectRatio: '1',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '1080px',
                  height: '1080px',
                  transform: 'scale(0.5185)',
                  transformOrigin: 'top left',
                }}
              >
                <ShareCard
                  firstName={firstName}
                  lastName={lastName}
                  company={userCompany}
                  archetypeName={archetype.name}
                  shortName={archetype.shortName}
                  archetypeId={results.archetype}
                  headshotUrl={stippleImage || results.formData.headshotPreview}
                  mostLikelyTo={results.bullets.mostLikelyTo}
                  typicallySpending={results.bullets.typicallySpending}
                  favoritePhrase={results.bullets.favoritePhrase}
                  transparent
                />
              </div>
            </div>

            {/* Share CTA button */}
            <button
              onClick={() => {
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
              className="w-full mt-4 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img src="/share-cta.svg" alt="Share My Player Card" className="w-full h-auto" />
            </button>
          </div>

          {/* Loading indicator */}
          {isGeneratingImage && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-white/70">
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
      </div>

      {/* Content below hero — Two-column layout */}
      <div className="bg-white px-4 sm:px-6 py-12">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-8">

          {/* ── Left Column (66%) ── */}
          <div className="w-full md:w-2/3">
            <div
              className="rounded-3xl p-6 sm:p-10 space-y-10"
              style={{
                backgroundColor: '#FDFFF3',
                border: '1.5px solid #586605',
              }}
            >
              {/* What You're Great At */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[#586605]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span
                    className="text-xs uppercase tracking-[0.15em] text-[#586605] font-semibold"
                    style={{ fontFamily: 'SaansMono, monospace' }}
                  >
                    What You&apos;re Great At
                  </span>
                </div>
                <div
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
                >
                  <ul className="space-y-3">
                    {archetype.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#586605] mt-0.5">&#10003;</span>
                        <span
                          className="text-[#0C0D01]"
                          style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}
                        >
                          {strength}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Level Up Zone */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[#586605]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span
                    className="text-xs uppercase tracking-[0.15em] text-[#586605] font-semibold"
                    style={{ fontFamily: 'SaansMono, monospace' }}
                  >
                    Level Up Zone
                  </span>
                </div>
                <div
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
                >
                  <p
                    className="text-[#0C0D01]"
                    style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}
                  >
                    {archetype.growthArea}
                  </p>
                </div>
              </div>

              {/* Your Training Playbook */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[#586605]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span
                    className="text-xs uppercase tracking-[0.15em] text-[#586605] font-semibold"
                    style={{ fontFamily: 'SaansMono, monospace' }}
                  >
                    Your Training Playbook
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {archetype.resources.map((resource, i) => {
                    const placeholderColors = ['#E8F0FE', '#FEF3E2', '#E8F5E9'];
                    return (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                        style={{ border: '1px solid #E5E7EB' }}
                      >
                        {/* Placeholder thumbnail */}
                        <div
                          className="h-28 flex items-center justify-center relative"
                          style={{ backgroundColor: placeholderColors[i % 3] }}
                        >
                          <span
                            className="absolute top-2 left-2 text-[10px] uppercase tracking-wider bg-white/90 text-[#586605] px-2 py-0.5 rounded-full font-semibold"
                            style={{ fontFamily: 'SaansMono, monospace' }}
                          >
                            {resource.type}
                          </span>
                        </div>
                        <div className="p-4 bg-white">
                          <p
                            className="text-[#0C0D01] font-medium text-sm"
                            style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}
                          >
                            {resource.title}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Personality Match */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[#586605]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span
                    className="text-xs uppercase tracking-[0.15em] text-[#586605] font-semibold"
                    style={{ fontFamily: 'SaansMono, monospace' }}
                  >
                    Personality Match
                  </span>
                </div>
                <div
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
                >
                  <p
                    className="text-[#0C0D01]"
                    style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}
                  >
                    {roleContent.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column (34%) ── */}
          <div className="w-full md:w-1/3">
            <div className="md:sticky md:top-8 space-y-6">
              {/* Player card — 1:1 duplicate of the hero card, scaled to fit */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  overflow: 'hidden',
                  borderRadius: '1.5rem',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '1080px',
                    height: '1080px',
                    transform: 'scale(0.37)',
                    transformOrigin: 'top left',
                  }}
                  ref={(el) => {
                    if (!el || typeof window === 'undefined') return;
                    const parent = el.parentElement;
                    if (!parent) return;
                    const scale = parent.clientWidth / 1080;
                    el.style.transform = `scale(${scale})`;
                  }}
                >
                  <ShareCard
                    firstName={firstName}
                    lastName={lastName}
                    company={userCompany}
                    archetypeName={archetype.name}
                    shortName={archetype.shortName}
                    archetypeId={results.archetype}
                    headshotUrl={stippleImage || results.formData.headshotPreview}
                    mostLikelyTo={results.bullets.mostLikelyTo}
                    typicallySpending={results.bullets.typicallySpending}
                    favoritePhrase={results.bullets.favoritePhrase}
                    transparent
                  />
                </div>
              </div>

              {/* Share section */}
              <div className="text-center">
                <p
                  className="text-[#0C0D01] font-semibold mb-4"
                  style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}
                >
                  Share your player card
                </p>
                <div className="flex flex-col gap-3">
                  {/* Twitter / X */}
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                    style={{ border: '1.5px solid #EEFF8C', color: '#0C0D01' }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on X
                  </a>
                  {/* LinkedIn */}
                  {shareableCardUrl ? (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                      style={{ border: '1.5px solid #EEFF8C', color: '#0C0D01' }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      Share on LinkedIn
                    </a>
                  ) : (
                    <div
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold opacity-50 cursor-not-allowed"
                      style={{ border: '1.5px solid #EEFF8C', color: '#0C0D01' }}
                    >
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Preparing...
                    </div>
                  )}
                  {/* Challenge / Copy Link */}
                  <button
                    onClick={() => {
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
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer hover:opacity-80"
                    style={{ border: '1.5px solid #EEFF8C', color: '#0C0D01' }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Challenge a Friend
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
