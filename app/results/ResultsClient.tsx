"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import html2canvas from "html2canvas";
import { archetypes, getBullets } from "@/lib/archetypes";
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
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(null);
  const [slackCopied, setSlackCopied] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, pointerX: 0, pointerY: 0, isHovering: false });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);
  const heroCardPlaceholderRef = useRef<HTMLDivElement>(null);
  const sidebarCardPlaceholderRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [heroCardRect, setHeroCardRect] = useState<DOMRect | null>(null);
  const [sidebarCardRect, setSidebarCardRect] = useState<DOMRect | null>(null);
  const [cardLanded, setCardLanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const ogCardRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

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
        // Show the image immediately while we persist it
        setStippleImage(data.imageUrl);

        // Upload stipple image to Vercel Blob and cache URL in Redis
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        if (userId) {
          try {
            const uniqueId = `stipple-${userId}-${Date.now()}`;
            const uploadRes = await fetch('/api/upload-card', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageBase64: data.imageUrl, uniqueId }),
            });
            const uploadData = await uploadRes.json();
            if (uploadData.url) {
              setStippleImage(uploadData.url);
              await fetch('/api/save-card-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, cardUrl: uploadData.url, field: 'stippleImageUrl' }),
              });
              console.log('Stipple image cached to Redis:', uploadData.url);
            }
          } catch (err) {
            console.warn('Failed to cache stipple image:', err);
          }
        }
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

  // Capture the OG card (card on archetype OG background) as the share image
  const captureAndUploadOgImage = useCallback(async () => {
    if (!ogCardRef.current || ogImageUrl) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(ogCardRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        width: 1080,
        height: 1080,
      });

      const imageBase64 = canvas.toDataURL('image/png');
      const uniqueId = `og-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch('/api/upload-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, uniqueId }),
      });

      const data = await response.json();
      if (data.url) {
        setOgImageUrl(data.url);
        console.log('OG image uploaded:', data.url);

        // Save OG image URL to Redis
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        if (userId) {
          await fetch('/api/save-card-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, cardUrl: data.url, field: 'ogImageUrl' }),
          });
          console.log('OG image URL saved to Redis');
        }
      }
    } catch (err) {
      console.error('Failed to capture OG image:', err);
    }
  }, [ogImageUrl]);

  // 3D tilt effect on hero card
  const handleTiltMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltRef.current) return;
    const rect = tiltRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 30;
    const rotateX = (0.5 - y) * 30;
    // pointerX/Y: -1 to 1 range for holographic layers
    const pointerX = Math.max(-1, Math.min(1, (x - 0.5) * 2));
    const pointerY = Math.max(-1, Math.min(1, (y - 0.5) * 2));
    setTilt({ rotateX, rotateY, pointerX, pointerY, isHovering: true });
  }, []);

  const handleTiltLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, pointerX: 0, pointerY: 0, isHovering: false });
  }, []);

  const handleFlip = useCallback(() => {
    setIsFlipping(true);
    setIsFlipped((prev) => !prev);
    setTimeout(() => setIsFlipping(false), 700);
  }, []);

  // Scroll-driven card travel animation
  useEffect(() => {
    const updateRects = () => {
      if (heroCardPlaceholderRef.current) {
        setHeroCardRect(heroCardPlaceholderRef.current.getBoundingClientRect());
      }
      if (sidebarCardPlaceholderRef.current) {
        setSidebarCardRect(sidebarCardPlaceholderRef.current.getBoundingClientRect());
      }
    };

    const handleScroll = () => {
      updateRects();

      if (!heroCardPlaceholderRef.current || !sidebarCardPlaceholderRef.current) return;

      const heroRect = heroCardPlaceholderRef.current.getBoundingClientRect();
      const sidebarRect = sidebarCardPlaceholderRef.current.getBoundingClientRect();

      // Delay: let user scroll past the hero card before it starts traveling
      // The card starts moving once user has scrolled ~540px (one card height) past the card
      const delayPx = 540;
      const travelStart = delayPx;
      const travelEnd = sidebarRect.top + window.scrollY - 32;
      const travelRange = travelEnd - travelStart;

      if (travelRange <= 0) {
        setScrollProgress(0);
        setCardLanded(false);
        return;
      }

      const progress = Math.min(1, Math.max(0, (window.scrollY - travelStart) / travelRange));
      setScrollProgress(progress);
      setCardLanded(progress >= 1);
    };

    updateRects();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateRects);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateRects);
    };
  }, [results]);

  // Compute floating card style
  const getFloatingCardStyle = useCallback((): React.CSSProperties | null => {
    if (!heroCardRect || !sidebarCardRect || cardLanded) return null;

    const t = scrollProgress;
    // Ease-out cubic for smooth deceleration
    const ease = 1 - Math.pow(1 - t, 3);

    const startW = 374;
    const startH = 540;
    const endW = sidebarCardRect.width;
    const endH = sidebarCardRect.width * (540 / 374);

    const startX = heroCardRect.left + (heroCardRect.width - startW) / 2;
    const startY = heroCardRect.top;
    const endX = sidebarCardRect.left;
    const endY = sidebarCardRect.top;

    const x = startX + (endX - startX) * ease;
    const y = startY + (endY - startY) * ease;
    const w = startW + (endW - startW) * ease;
    const h = startH + (endH - startH) * ease;

    return {
      position: 'fixed' as const,
      left: `${x}px`,
      top: `${y}px`,
      width: `${w}px`,
      height: `${h}px`,
      zIndex: 1000,
      pointerEvents: 'none' as const,
      overflow: 'hidden',
      borderRadius: '12px',
      transition: 'none',
    };
  }, [heroCardRect, sidebarCardRect, scrollProgress, cardLanded]);

  // Trigger card capture + OG image capture when stipple image is ready
  useEffect(() => {
    if (stippleImage && !shareableCardUrl && !isCapturingCard) {
      const timer = setTimeout(() => {
        captureAndUploadCard();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stippleImage, shareableCardUrl, isCapturingCard, captureAndUploadCard]);

  // Capture OG image after card capture completes
  useEffect(() => {
    if (shareableCardUrl && !ogImageUrl) {
      const timer = setTimeout(() => {
        captureAndUploadOgImage();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shareableCardUrl, ogImageUrl, captureAndUploadOgImage]);

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

          // Always call enrichment when linkedinUrl is present - this validates
          // the headshot blob URL and re-downloads if it's gone (404)
          if (data.linkedinUrl) {
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

          // Use cached stipple image if available, otherwise generate via Gemini
          // The headshot URL should now be available from enrichment above
          if (resultData.stippleImageUrl) {
            setStippleImage(resultData.stippleImageUrl);
          } else {
            generateCardImage(newResults);
          }
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

    const bullets = getBullets(archetype, role);
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

  // Loading state with rotating messages
  const loadingMessages = [
    "Finding your LinkedIn profile...",
    "Pulling in your details...",
    "Analyzing your content style...",
    "Crunching the numbers...",
    "Matching you to an archetype...",
    "Building your player card...",
    "Almost there...",
  ];
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    if (results) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [results, loadingMessages.length]);

  if (!results) {
    return (
      <div className="min-h-screen bg-[#4ADE80] flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-12 h-12 border-4 border-[#0D3D1F]/20 border-t-[#0D3D1F] rounded-full animate-spin" />
        <div
          key={loadingMsgIndex}
          className="text-[#0D3D1F] text-[28px] md:text-[36px] text-center leading-[1.2]"
          style={{
            fontFamily: 'Serrif, serif',
            animation: 'fadeIn 0.5s ease-out',
          }}
        >
          {loadingMessages[loadingMsgIndex]}
        </div>
        <p className="text-[#0D3D1F]/50 text-sm" style={{ fontFamily: 'SaansMono, monospace' }}>
          This usually takes 15-30 seconds
        </p>
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
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

  // Share URLs — use userId so the share page can fetch OG image from Redis
  const userId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('userId') : null;
  const shareText = `I just discovered I'm "The ${archetype.name}" — ${roleContent.tagline}. Take the quiz to find your Content Engineer archetype!`;

  const buildSharePageUrl = () => {
    if (typeof window === 'undefined') return 'https://airops.com/win';
    const baseUrl = window.location.origin;
    const url = new URL('/share', baseUrl);
    if (userId) url.searchParams.set('userId', userId);
    return url.toString();
  };

  const sharePageUrlStr = buildSharePageUrl();
  const quizUrl = typeof window !== 'undefined' ? `${window.location.origin}/quiz` : 'https://airops.com/win';
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(sharePageUrlStr)}`;
  // LinkedIn: pre-populate compose with TLDR results + the single share URL.
  // The share URL MUST be the only URL so LinkedIn crawls it for OG metadata
  // (personalized image + title). The share page's og:url already points to /quiz,
  // so clicking the preview card takes people to the quiz.
  const linkedinTldr = [
    `I just took the Content Engineer quiz and I'm "The ${archetype.name}" — ${roleContent.tagline}`,
    ``,
    `Most likely to: ${results.bullets.mostLikelyTo}`,
    `Typically spending time: ${results.bullets.typicallySpending}`,
    `Favorite phrase: "${results.bullets.favoritePhrase}"`,
    ``,
    `Find your archetype:`,
    sharePageUrlStr,
  ].join('\n');
  const linkedinUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(linkedinTldr)}`;

  return (
    <div className="min-h-screen relative">
      {/* Hero section with background image */}
      <div
        ref={heroRef}
        className="relative w-full"
        style={{
          backgroundImage: `url(/images/results-header-bg-${results.archetype}.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '40px 24px 192px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Dark overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(0deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.30) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Archetype header SVG */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1440px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img
            src={`/headers/the-${archetype.id}-header.svg`}
            alt={`The ${archetype.name}`}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>

        {/* Card + Share button area */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}
        >
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
          {/* Hidden OG card — card on archetype-specific OG background */}
          <div
            style={{
              position: 'absolute',
              left: '-9999px',
              top: '1100px',
            }}
          >
            <ShareCard
              ref={ogCardRef}
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
              bgImageOverride={`/images/og-bg-${results.archetype}.png`}
            />
          </div>

          {/* Hero card placeholder — reserves space, visible only when card hasn't started traveling */}
          <div
            ref={heroCardPlaceholderRef}
            style={{
              width: '374px',
              height: '540px',
            }}
          >
            {scrollProgress === 0 && (
              <div
                ref={tiltRef}
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
                onClick={handleFlip}
                style={{
                  perspective: '1000px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '374px',
                    height: '540px',
                    position: 'relative',
                    transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY + (isFlipped ? 180 : 0)}deg)`,
                    transition: isFlipping
                      ? 'transform 0.7s ease-in-out, box-shadow 0.7s ease-in-out'
                      : (!tilt.isHovering ? 'transform 0.5s ease-out, box-shadow 0.5s ease-out' : 'transform 0.1s ease-out, box-shadow 0.1s ease-out'),
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    boxShadow: !tilt.isHovering
                      ? '0 10px 30px rgba(0,0,0,0.3)'
                      : `${-tilt.rotateY * 1.5}px ${tilt.rotateX * 1.5}px 40px rgba(0,0,0,0.4), ${-tilt.rotateY * 0.5}px ${tilt.rotateX * 0.5}px 15px rgba(0,0,0,0.2)`,
                  }}
                >
                  {/* ── FRONT FACE ── */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      overflow: 'hidden',
                      borderRadius: '12px',
                    }}
                  >
                    {/* Base card art */}
                    <div
                      style={{
                        width: '1080px',
                        height: '1080px',
                        transform: 'scale(0.5834)',
                        transformOrigin: 'top left',
                        position: 'absolute',
                        left: '-128px',
                        top: '-45px',
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

                    {/* Holographic pattern layer — masked rainbow refraction */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        mixBlendMode: 'multiply',
                        opacity: tilt.isHovering && !isFlipped ? 0.4 : 0,
                        transition: 'opacity 0.3s ease-out',
                        maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\'%3E%3Crect width=\'4\' height=\'4\' fill=\'white\'/%3E%3Crect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'white\'/%3E%3C/svg%3E")',
                        maskSize: '6px 6px',
                        WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\'%3E%3Crect width=\'4\' height=\'4\' fill=\'white\'/%3E%3Crect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'white\'/%3E%3C/svg%3E")',
                        WebkitMaskSize: '6px 6px',
                        filter: 'saturate(2)',
                        zIndex: 5,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          width: '500%',
                          aspectRatio: '1',
                          bottom: 0,
                          left: 0,
                          transformOrigin: '0 100%',
                          background: 'radial-gradient(circle at 0 100%, transparent 10%, hsl(5,100%,80%), hsl(150,100%,60%), hsl(220,90%,70%), transparent 60%)',
                          scale: `${Math.min(1, 0.15 + tilt.pointerX * 0.25)}`,
                          translate: `clamp(-10%, ${-10 + tilt.pointerX * 10}%, 10%) ${Math.max(0, tilt.pointerY * -1 * 10)}%`,
                          transition: !tilt.isHovering ? 'all 0.3s ease-out' : 'none',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          width: '500%',
                          aspectRatio: '1',
                          top: 0,
                          right: 0,
                          transformOrigin: '100% 0',
                          background: 'radial-gradient(circle at 100% 0, transparent 10%, hsl(5,100%,80%), hsl(150,100%,60%), hsl(220,90%,70%), transparent 60%)',
                          scale: `${Math.min(1, 0.15 + tilt.pointerX * -0.65)}`,
                          translate: `clamp(-10%, ${10 + tilt.pointerX * 10}%, 10%) ${Math.min(0, tilt.pointerY * -10)}%`,
                          transition: !tilt.isHovering ? 'all 0.3s ease-out' : 'none',
                        }}
                      />
                    </div>

                    {/* Watermark holographic layer */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        mixBlendMode: 'hard-light',
                        opacity: tilt.isHovering && !isFlipped ? 0.35 : 0,
                        transition: 'opacity 0.3s ease-out',
                        maskImage: 'repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)',
                        maskSize: '12px 12px',
                        WebkitMaskImage: 'repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)',
                        WebkitMaskSize: '12px 12px',
                        filter: 'saturate(0.9) contrast(1.1) brightness(1.2)',
                        zIndex: 6,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          width: '500%',
                          aspectRatio: '1',
                          bottom: 0,
                          left: 0,
                          transformOrigin: '0 100%',
                          background: 'radial-gradient(circle at 0 100%, transparent 10%, hsl(5,100%,80%), hsl(150,100%,60%), hsl(220,90%,70%), transparent 60%)',
                          scale: `${Math.min(1, 0.15 + tilt.pointerX * 0.25)}`,
                          translate: `clamp(-10%, ${-10 + tilt.pointerX * 10}%, 10%) ${Math.max(0, tilt.pointerY * -1 * 10)}%`,
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          width: '500%',
                          aspectRatio: '1',
                          top: 0,
                          right: 0,
                          transformOrigin: '100% 0',
                          background: 'radial-gradient(circle at 100% 0, transparent 10%, hsl(5,100%,80%), hsl(150,100%,60%), hsl(220,90%,70%), transparent 60%)',
                          scale: `${Math.min(1, 0.15 + tilt.pointerX * -0.65)}`,
                          translate: `clamp(-10%, ${10 + tilt.pointerX * 10}%, 10%) ${Math.min(0, tilt.pointerY * -10)}%`,
                        }}
                      />
                    </div>

                    {/* Spotlight */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        mixBlendMode: 'overlay',
                        zIndex: 8,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          width: '500%',
                          aspectRatio: '1',
                          background: 'radial-gradient(hsl(0 0% 100% / 0.4) 0 2%, hsl(0 0% 10% / 0.2) 20%)',
                          filter: 'brightness(1.2) contrast(1.2)',
                          translate: `calc(-50% + ${tilt.pointerX * 20}%) calc(-50% + ${tilt.pointerY * 20}%)`,
                          opacity: tilt.isHovering && !isFlipped ? 1 : 0,
                          transition: !tilt.isHovering ? 'opacity 0.3s ease-out, translate 0.3s ease-out' : 'none',
                        }}
                      />
                    </div>

                    {/* Edge glare */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        opacity: tilt.isHovering && !isFlipped ? 0.15 : 0,
                        transition: 'opacity 0.3s ease-out',
                        background: 'linear-gradient(-65deg, transparent 0% 40%, #fff 40% 50%, transparent 50%, transparent 55%, #fff 55% 60%, transparent 60% 100%)',
                        zIndex: 9,
                      }}
                    />
                  </div>

                  {/* ── BACK FACE ── */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      overflow: 'hidden',
                      borderRadius: '12px',
                    }}
                  >
                    <img
                      src="/images/card-back.svg"
                      alt="Card back"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />

                    {/* Holographic pattern layer */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        mixBlendMode: 'screen',
                        opacity: tilt.isHovering && isFlipped ? 0.5 : 0,
                        transition: 'opacity 0.3s ease-out',
                        maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\'%3E%3Crect width=\'4\' height=\'4\' fill=\'white\'/%3E%3Crect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'white\'/%3E%3C/svg%3E")',
                        maskSize: '6px 6px',
                        WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\'%3E%3Crect width=\'4\' height=\'4\' fill=\'white\'/%3E%3Crect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'white\'/%3E%3C/svg%3E")',
                        WebkitMaskSize: '6px 6px',
                        filter: 'saturate(2)',
                        zIndex: 5,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          width: '500%',
                          aspectRatio: '1',
                          bottom: 0,
                          left: 0,
                          transformOrigin: '0 100%',
                          background: 'radial-gradient(circle at 0 100%, transparent 10%, hsl(5,100%,80%), hsl(150,100%,60%), hsl(220,90%,70%), transparent 60%)',
                          scale: `${Math.min(1, 0.15 + tilt.pointerX * -0.25)}`,
                          translate: `clamp(-10%, ${-10 - tilt.pointerX * 10}%, 10%) ${Math.max(0, tilt.pointerY * -1 * 10)}%`,
                          transition: !tilt.isHovering ? 'all 0.3s ease-out' : 'none',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          width: '500%',
                          aspectRatio: '1',
                          top: 0,
                          right: 0,
                          transformOrigin: '100% 0',
                          background: 'radial-gradient(circle at 100% 0, transparent 10%, hsl(5,100%,80%), hsl(150,100%,60%), hsl(220,90%,70%), transparent 60%)',
                          scale: `${Math.min(1, 0.15 + tilt.pointerX * 0.65)}`,
                          translate: `clamp(-10%, ${10 - tilt.pointerX * 10}%, 10%) ${Math.min(0, tilt.pointerY * -10)}%`,
                          transition: !tilt.isHovering ? 'all 0.3s ease-out' : 'none',
                        }}
                      />
                    </div>

                    {/* Watermark holographic layer */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        mixBlendMode: 'color-dodge',
                        opacity: tilt.isHovering && isFlipped ? 0.3 : 0,
                        transition: 'opacity 0.3s ease-out',
                        maskImage: 'repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)',
                        maskSize: '12px 12px',
                        WebkitMaskImage: 'repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)',
                        WebkitMaskSize: '12px 12px',
                        filter: 'saturate(0.9) contrast(1.1) brightness(1.2)',
                        zIndex: 6,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          width: '500%',
                          aspectRatio: '1',
                          bottom: 0,
                          left: 0,
                          transformOrigin: '0 100%',
                          background: 'radial-gradient(circle at 0 100%, transparent 10%, hsl(5,100%,80%), hsl(150,100%,60%), hsl(220,90%,70%), transparent 60%)',
                          scale: `${Math.min(1, 0.15 + tilt.pointerX * -0.25)}`,
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          width: '500%',
                          aspectRatio: '1',
                          top: 0,
                          right: 0,
                          transformOrigin: '100% 0',
                          background: 'radial-gradient(circle at 100% 0, transparent 10%, hsl(5,100%,80%), hsl(150,100%,60%), hsl(220,90%,70%), transparent 60%)',
                          scale: `${Math.min(1, 0.15 + tilt.pointerX * 0.65)}`,
                        }}
                      />
                    </div>

                    {/* Spotlight */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        mixBlendMode: 'overlay',
                        zIndex: 8,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          width: '500%',
                          aspectRatio: '1',
                          background: 'radial-gradient(hsl(0 0% 100% / 0.5) 0 2%, hsl(0 0% 10% / 0.3) 20%)',
                          filter: 'brightness(1.2) contrast(1.2)',
                          translate: `calc(-50% + ${-tilt.pointerX * 20}%) calc(-50% + ${tilt.pointerY * 20}%)`,
                          opacity: tilt.isHovering && isFlipped ? 1 : 0,
                          transition: !tilt.isHovering ? 'opacity 0.3s ease-out, translate 0.3s ease-out' : 'none',
                        }}
                      />
                    </div>

                    {/* Edge glare */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        overflow: 'hidden',
                        opacity: tilt.isHovering && isFlipped ? 0.2 : 0,
                        transition: 'opacity 0.3s ease-out',
                        background: 'linear-gradient(-65deg, transparent 0% 40%, rgba(117,255,185,0.6) 40% 50%, transparent 50%, transparent 55%, rgba(117,255,185,0.4) 55% 60%, transparent 60% 100%)',
                        zIndex: 9,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Flip hint */}
          <p
            style={{
              fontFamily: 'SaansMono, monospace',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginTop: '-8px',
            }}
          >
            Click card to flip
          </p>

          {/* Share CTA button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(sharePageUrlStr);
              alert('Link copied!');
            }}
            style={{
              width: '374px',
              padding: '16px',
              background: '#00FF64',
              borderRadius: '58px',
              display: 'inline-flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              border: 'none',
              cursor: 'pointer',
            }}
            className="hover:opacity-90 transition-opacity"
          >
            <span
              style={{
                color: '#000D05',
                fontSize: '20px',
                fontFamily: 'Saans, sans-serif',
                fontWeight: 500,
                lineHeight: '20px',
              }}
            >
              Share My Player Card
            </span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ overflow: 'hidden' }}>
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#000D05" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Loading indicator */}
          {isGeneratingImage && (
            <div style={{ textAlign: 'center' }}>
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
            <div style={{ textAlign: 'center' }}>
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
              {/* Your Winning Play */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[#586605]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span
                    className="text-xs uppercase tracking-[0.15em] text-[#586605] font-semibold"
                    style={{ fontFamily: 'SaansMono, monospace' }}
                  >
                    Your Winning Play
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
                    {roleContent.winningPlay}
                  </p>
                </div>
              </div>

              {/* Where to Focus */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[#586605]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span
                    className="text-xs uppercase tracking-[0.15em] text-[#586605] font-semibold"
                    style={{ fontFamily: 'SaansMono, monospace' }}
                  >
                    Where to Focus
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
                    {roleContent.whereToFocus}
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
                  {roleContent.resources.map((resource, i) => {
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
                        {/* Thumbnail */}
                        <div
                          className="flex items-center justify-center relative overflow-hidden"
                          style={{ backgroundColor: placeholderColors[i % 3], aspectRatio: '16 / 9' }}
                        >
                          {resource.ogImage && (
                            <img
                              src={resource.ogImage}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )}
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

              {/* Level Up */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[#586605]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span
                    className="text-xs uppercase tracking-[0.15em] text-[#586605] font-semibold"
                    style={{ fontFamily: 'SaansMono, monospace' }}
                  >
                    Level Up
                  </span>
                </div>
                <a
                  href={roleContent.levelUpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl p-6 hover:shadow-md transition-shadow"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
                >
                  <p
                    className="text-[#0C0D01] font-medium"
                    style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}
                  >
                    {results.role === 'ic' ? 'Enroll in Cohort \u2192' : 'Book a Call \u2192'}
                  </p>
                </a>
              </div>
            </div>
          </div>

          {/* ── Right Column (34%) ── */}
          <div className="w-full md:w-1/3">
            <div className="md:sticky md:top-8 space-y-6">
              {/* Player card landing zone */}
              <div
                ref={(el) => {
                  (sidebarCardPlaceholderRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                  if (!el || typeof window === 'undefined') return;
                  if (cardLanded) {
                    const containerWidth = el.clientWidth;
                    const scale = containerWidth / 641;
                    const inner = el.querySelector('[data-card-inner]') as HTMLElement;
                    if (inner) {
                      inner.style.transform = `scale(${scale})`;
                      inner.style.left = `${-220 * scale}px`;
                      inner.style.top = `${-77 * scale}px`;
                    }
                  }
                }}
                style={{
                  width: '100%',
                  aspectRatio: '374 / 540',
                  overflow: 'hidden',
                  borderRadius: '1.5rem',
                  position: 'relative',
                }}
              >
                {cardLanded && (
                  <div
                    data-card-inner
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
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
                      archetypeId={results.archetype}
                      headshotUrl={stippleImage || results.formData.headshotPreview}
                      mostLikelyTo={results.bullets.mostLikelyTo}
                      typicallySpending={results.bullets.typicallySpending}
                      favoritePhrase={results.bullets.favoritePhrase}
                      transparent
                    />
                  </div>
                )}
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
                  {/* Slack */}
                  <button
                    onClick={() => {
                      const slackMessage = `${shareText}\n\n${sharePageUrlStr}`;
                      navigator.clipboard.writeText(slackMessage);
                      setSlackCopied(true);
                      setTimeout(() => setSlackCopied(false), 3000);
                      // Open Slack app via protocol handler
                      window.location.href = 'slack://open';
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer hover:opacity-80"
                    style={{ border: '1.5px solid #EEFF8C', color: '#0C0D01' }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z" />
                    </svg>
                    {slackCopied ? 'Copied! Paste in Slack' : 'Share on Slack'}
                  </button>
                  {/* Download Card */}
                  {shareableCardUrl ? (
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(shareableCardUrl);
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `the-${archetype.id}-player-card.png`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        } catch {
                          // Fallback: open in new tab
                          window.open(shareableCardUrl, '_blank');
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer hover:opacity-80"
                      style={{ border: '1.5px solid #EEFF8C', color: '#0C0D01' }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Card
                    </button>
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
                      navigator.clipboard.writeText(sharePageUrlStr);
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

      {/* Floating card — travels from hero to sidebar on scroll */}
      {scrollProgress > 0 && !cardLanded && (() => {
        const style = getFloatingCardStyle();
        if (!style) return null;
        const w = parseFloat(String(style.width));
        const h = parseFloat(String(style.height));
        // Scale the 1080×1080 canvas to fit the interpolated width, cropping to inner card
        const innerScale = w / 641;
        return (
          <div style={style}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '1080px',
                height: '1080px',
                transform: `scale(${innerScale})`,
                transformOrigin: 'top left',
                marginLeft: `${-220 * innerScale}px`,
                marginTop: `${-77 * innerScale}px`,
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
        );
      })()}
    </div>
  );
}
