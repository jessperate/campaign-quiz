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
  const [linkedinCopied, setLinkedinCopied] = useState(false);
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
  const [heroAnimStage, setHeroAnimStage] = useState<'hidden' | 'title-in' | 'card-in'>('hidden');
  const cardRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [recentCards, setRecentCards] = useState<Array<{
    userId: string;
    firstName: string;
    lastName: string;
    company: string;
    archetypeId: string;
    archetypeName: string;
    shortName: string;
    headshotUrl: string;
    stippleImageUrl: string;
    mostLikelyTo: string;
    typicallySpending: string;
    favoritePhrase: string;
  }>>([]);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const generateCardImage = async (resultsData: QuizResults, retryCount = 0) => {
    setIsGeneratingImage(true);
    setImageError(null);

    const MAX_CLIENT_RETRIES = 3;

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
      } else if (retryCount < MAX_CLIENT_RETRIES) {
        console.warn(`Stipple generation failed (attempt ${retryCount + 1}/${MAX_CLIENT_RETRIES}), retrying in ${(retryCount + 1) * 3}s...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 3000));
        return generateCardImage(resultsData, retryCount + 1);
      } else {
        // Stipple failed — fall back to original photo (card already uses headshotPreview as fallback)
        console.warn('Stipple generation exhausted retries, falling back to original photo');
      }
    } catch (err) {
      if (retryCount < MAX_CLIENT_RETRIES) {
        console.warn(`Stipple generation error (attempt ${retryCount + 1}/${MAX_CLIENT_RETRIES}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 3000));
        return generateCardImage(resultsData, retryCount + 1);
      }
      // Stipple failed — fall back to original photo
      console.warn('Stipple generation error exhausted retries, falling back to original photo');
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

  // Generate the 1200x630 OG image via the server-side Satori endpoint,
  // upload to Blob, and save the static URL in Redis so LinkedIn can fetch it instantly.
  const captureAndUploadOgImage = useCallback(async () => {
    if (ogImageUrl) return;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');
      if (!userId) return;

      // Fetch the server-rendered 1200x630 OG image
      const ogRes = await fetch(`/api/og-image?userId=${encodeURIComponent(userId)}`);
      if (!ogRes.ok) {
        console.warn('OG image generation failed:', ogRes.status);
        return;
      }

      const blob = await ogRes.blob();
      const reader = new FileReader();
      const imageBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const uniqueId = `og-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const uploadRes = await fetch('/api/upload-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, uniqueId }),
      });

      const data = await uploadRes.json();
      if (data.url) {
        setOgImageUrl(data.url);
        console.log('OG image uploaded:', data.url);

        await fetch('/api/save-card-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, cardUrl: data.url, field: 'ogImageUrl' }),
        });
        console.log('OG image URL saved to Redis');
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

  // Scroll-driven card travel animation (desktop only)
  useEffect(() => {
    // On mobile, skip the floating card animation entirely — card stays in hero
    if (isMobile) {
      setCardLanded(true);
      return;
    }

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
  }, [results, isMobile]);

  // Compute floating card style (desktop only — mobile skips this)
  const getFloatingCardStyle = useCallback((): React.CSSProperties | null => {
    if (isMobile || !heroCardRect || !sidebarCardRect || cardLanded) return null;

    const t = scrollProgress;
    // Ease-out cubic for smooth deceleration
    const ease = 1 - Math.pow(1 - t, 3);

    const startW = isMobile ? 260 : 374;
    const startH = isMobile ? 375 : 540;
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

  // Trigger card capture + OG image capture when the card is ready to render.
  // This fires when: (a) stipple image arrives, or (b) generation finishes
  // without producing a stipple (failed or no photo — card uses original/fallback).
  useEffect(() => {
    if (!results || shareableCardUrl || isCapturingCard) return;
    // Wait for stipple generation to finish before capturing
    if (isGeneratingImage) return;
    const timer = setTimeout(() => {
      captureAndUploadCard();
    }, 1500);
    return () => clearTimeout(timer);
  }, [results, stippleImage, isGeneratingImage, shareableCardUrl, isCapturingCard, captureAndUploadCard]);

  // Capture OG image after card capture completes
  useEffect(() => {
    if (shareableCardUrl && !ogImageUrl) {
      const timer = setTimeout(() => {
        captureAndUploadOgImage();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shareableCardUrl, ogImageUrl, captureAndUploadOgImage]);

  // Fetch recent cards for gallery
  useEffect(() => {
    fetch('/api/all-cards')
      .then(res => res.json())
      .then(data => {
        if (data.cards) {
          // Exclude current user and limit to 20
          const urlParams = new URLSearchParams(window.location.search);
          const currentUserId = urlParams.get('userId');
          const others = data.cards
            .filter((c: { userId: string }) => c.userId !== currentUserId)
            .slice(0, 20);
          setRecentCards(others);
        }
      })
      .catch(() => {});
  }, []);

  // IntersectionObserver for gallery scroll reveal
  useEffect(() => {
    if (!galleryRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setGalleryVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(galleryRef.current);
    return () => observer.disconnect();
  }, [recentCards.length]);

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

          const resultData = data;

          const archetypeId = resultData.archetype.id as ArchetypeId;
          const role = resultData.role as Role;

          const newResults: QuizResults = {
            archetype: archetypeId,
            role,
            bullets: resultData.bullets,
            formData: {
              email: resultData.email || "",
              fullName: `${resultData.firstName || ""} ${resultData.lastName || ""}`.trim(),
              title: "",
              company: resultData.company || "",
              wantsDemo: false,
              headshotUrl: resultData.headshotUrl || "",
            },
          };
          setResults(newResults);

          // Use cached images if available
          if (resultData.stippleImageUrl) {
            setStippleImage(resultData.stippleImageUrl);
          } else {
            generateCardImage(newResults);
          }
          if (resultData.ogImageUrl) {
            setOgImageUrl(resultData.ogImageUrl);
          }
          if (resultData.cardImageUrl) {
            setShareableCardUrl(resultData.cardImageUrl);
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

  // Hero entrance animation sequence
  useEffect(() => {
    if (!results) return;
    const t1 = setTimeout(() => setHeroAnimStage('title-in'), 100);
    const t2 = setTimeout(() => setHeroAnimStage('card-in'), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [results]);

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

  // Per-archetype results page theme
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const darken = (hex: string, pct: number) => {
    const f = 1 - pct / 100;
    const r = Math.round(parseInt(hex.slice(1, 3), 16) * f);
    const g = Math.round(parseInt(hex.slice(3, 5), 16) * f);
    const b = Math.round(parseInt(hex.slice(5, 7), 16) * f);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  };

  const RESULTS_THEMES: Record<string, {
    bg: string; cardBg: string; headline: string; body: string; secondaryBtn: string;
  }> = {
    trendsetter: { bg: '#1B1B8F', cardBg: '#0F0F57', headline: '#F5F6FF', body: '#E5E5FF', secondaryBtn: '#000D05' },
    vision:      { bg: '#196C80', cardBg: '#0A3945', headline: '#F2FCFF', body: '#C9EBF2', secondaryBtn: '#020B0D' },
    glue:        { bg: '#586605', cardBg: '#242603', headline: '#FDFFF3', body: '#EEFF8C', secondaryBtn: '#0C0D01' },
    goGoGoer:    { bg: '#802828', cardBg: '#331010', headline: '#FFF0F0', body: '#FFE2E2', secondaryBtn: '#0D0404' },
    tastemaker:  { bg: '#5A3480', cardBg: '#2A084D', headline: '#F8F7FF', body: '#DDD3F2', secondaryBtn: '#07010D' },
    clutch:      { bg: '#008C44', cardBg: '#002910', headline: '#F8FFFB', body: '#DFEAE3', secondaryBtn: '#000D05' },
    heart:       { bg: '#C54B9B', cardBg: '#3A092C', headline: '#FFF7FF', body: '#FEE7FD', secondaryBtn: '#0D020A' },
  };
  const rt = RESULTS_THEMES[results.archetype] || RESULTS_THEMES.trendsetter;
  const cardInner = darken(rt.cardBg, 30);
  const cardBorder = hexToRgba(rt.body, 0.15);
  const dividerColor = hexToRgba(rt.body, 0.1);

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
  const shareBody = [
    `I took the @AirOps Marketype quiz and I got The ${archetype.name} -- ${roleContent.tagline}`,
    ``,
    `- Most likely to: ${results.bullets.mostLikelyTo}`,
    `- Spend time: ${results.bullets.typicallySpending}`,
    `- Favorite phrase: ${results.bullets.favoritePhrase}`,
    ``,
    `Find out what kind of player you are at airops.com/win`,
  ].join('\n');

  // Share base for user-facing links (quiz CTA, etc.)
  const shareBase = process.env.NEXT_PUBLIC_SHARE_BASE_URL || 'https://www.airops.com';
  // OG base: the Vercel app serves /share with OG meta tags, then redirects to airops.com/results
  const ogBase = 'https://campaign-quiz.vercel.app';

  const buildSharePageUrl = () => {
    // Share URL points to Vercel /share route which serves OG tags then redirects to airops.com/results
    const url = new URL('/share', ogBase);
    if (userId) url.searchParams.set('userId', userId);
    return url.toString();
  };

  const sharePageUrlStr = buildSharePageUrl();
  const quizUrl = `${shareBase}/quiz`;
  const twitterBody = `I took the @AirOps Marketype quiz and I got The ${archetype.name}. Find out what kind of player you are:`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterBody)}&url=${encodeURIComponent('https://www.airops.com/win')}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://www.airops.com/win')}`;

  return (
    <div className="min-h-screen relative rp" style={{ background: rt.bg }}>
      {/* Dynamic theme CSS overrides for Tailwind color classes */}
      <style dangerouslySetInnerHTML={{ __html: `
        .rp [class*="text-[#E6E6FF]"] { color: ${rt.body} !important; }
        .rp [class*="text-[#E6E6FF]/70"] { color: ${hexToRgba(rt.body, 0.7)} !important; }
        .rp [class*="text-[#E6E6FF]/60"] { color: ${hexToRgba(rt.body, 0.6)} !important; }
        .rp [class*="text-[#E6E6FF]/50"] { color: ${hexToRgba(rt.body, 0.5)} !important; }
        .rp [class*="text-[#E6E6FF]/40"] { color: ${hexToRgba(rt.body, 0.4)} !important; }
      `}} />
      {/* Hero section */}
      <div
        ref={heroRef}
        className="relative w-full"
        style={{
          background: rt.bg,
          // On mobile, use min-height with dvh for better mobile browser support
          minHeight: isMobile ? '100dvh' : '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: isMobile ? '32px 16px 40px' : '40px 24px 80px',
        }}
      >
        {/* AirOps logo — fixed to top of page */}
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
          }}
        >
          <img
            src="/images/airops-logo.svg"
            alt="airops"
            style={{ width: '100px', height: 'auto' }}
          />
        </div>

        {/* Leaf pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/images/hero-leaf-pattern.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
          }}
        />

        {/* Left vertical edge line */}
        {!isMobile && (
          <div
            style={{
              position: 'absolute',
              left: '24px',
              top: 0,
              bottom: 0,
              width: '1px',
              background: rt.body,
              opacity: 0.3,
            }}
          />
        )}
        {/* Right vertical edge line */}
        {!isMobile && (
          <div
            style={{
              position: 'absolute',
              right: '24px',
              top: 0,
              bottom: 0,
              width: '1px',
              background: rt.body,
              opacity: 0.3,
            }}
          />
        )}

        {/* "YOUR PLAYER CARD" label */}
        <p
          style={{
            position: 'relative',
            fontFamily: 'SaansMono, monospace',
            fontSize: '12px',
            color: rt.headline,
            textTransform: 'uppercase',
            letterSpacing: '4px',
            marginBottom: '32px',
            opacity: heroAnimStage !== 'hidden' ? 1 : 0,
            transform: heroAnimStage !== 'hidden' ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        >
          Your Player Card
        </p>

        {/* Title + Card zone */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Archetype card-title SVG */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              zIndex: 1,
              opacity: heroAnimStage !== 'hidden' ? 1 : 0,
              transform: heroAnimStage !== 'hidden' ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
              // On mobile: don't overlap, just show above the card
              ...(isMobile ? { marginBottom: '-20px' } : {}),
            }}
          >
            <img
              src={`/headers/card-title-${archetype.id}.svg`}
              alt={`The ${archetype.name}`}
              style={{ width: '100%', height: 'auto' }}
              onError={(e) => {
                e.currentTarget.src = `/headers/the-${archetype.id}-header.svg`;
              }}
            />
          </div>

          {/* Card container */}
          <div
            style={{
              // Desktop: absolutely positioned over the title
              // Mobile: stacked below the title, centered
              ...(isMobile
                ? {
                    position: 'relative' as const,
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column' as const,
                    alignItems: 'center',
                    gap: '20px',
                    opacity: heroAnimStage === 'card-in' ? 1 : 0,
                    transform: heroAnimStage === 'card-in' ? 'translateY(0)' : 'translateY(40px)',
                    transition: 'opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }
                : {
                    position: 'absolute' as const,
                    top: '50%',
                    left: '50%',
                    transform: heroAnimStage === 'card-in'
                      ? 'translate(-50%, -50%)'
                      : 'translate(-50%, calc(-50% - 80px))',
                    opacity: heroAnimStage === 'card-in' ? 1 : 0,
                    transition: 'opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column' as const,
                    alignItems: 'center',
                    gap: '24px',
                  }
              ),
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
            {/* Hidden download card — 1200x630 landscape with archetype background, no bottom bar */}
            <div
              ref={downloadRef}
              style={{
                position: 'absolute',
                left: '-9999px',
                top: '1100px',
                width: '1200px',
                height: '630px',
                overflow: 'hidden',
                backgroundColor: '#000000',
              }}
            >
              <img
                src={`/images/og-bg-${results.archetype}.jpg`}
                alt=""
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '1200px',
                  height: '630px',
                  objectFit: 'cover',
                  opacity: 0.6,
                }}
                crossOrigin="anonymous"
              />
              <div
                style={{
                  position: 'absolute',
                  left: '285px',
                  top: '0px',
                  width: '1080px',
                  height: '1080px',
                  transform: 'scale(0.583)',
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
                  transparent={true}
                />
              </div>
            </div>
            {/* Hero card placeholder — reserves space, visible only when card hasn't started traveling */}
            <div
              ref={heroCardPlaceholderRef}
              style={{
                width: isMobile ? 0 : '374px',
                height: isMobile ? 0 : '540px',
                // On mobile, card lives at the bottom of the page instead
                ...(isMobile ? { overflow: 'hidden' } : {}),
              }}
            >
              {(!isMobile && scrollProgress === 0) && (
                <div
                  ref={tiltRef}
                  onMouseMove={isMobile ? undefined : handleTiltMove}
                  onMouseLeave={isMobile ? undefined : handleTiltLeave}
                  onClick={handleFlip}
                  style={{
                    perspective: isMobile ? 'none' : '1000px',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: isMobile ? 'min(75vw, 300px)' : '374px',
                      height: isMobile ? 'min(108vw, 433px)' : '540px',
                      position: 'relative',
                      // Mobile: only flip, no tilt. Desktop: tilt + flip.
                      transform: isMobile
                        ? `rotateY(${isFlipped ? 180 : 0}deg)`
                        : `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY + (isFlipped ? 180 : 0)}deg)`,
                      transition: isMobile
                        ? 'transform 0.7s ease-in-out'
                        : (isFlipping
                          ? 'transform 0.7s ease-in-out, box-shadow 0.7s ease-in-out'
                          : (!tilt.isHovering ? 'transform 0.5s ease-out, box-shadow 0.5s ease-out' : 'transform 0.1s ease-out, box-shadow 0.1s ease-out')),
                      transformStyle: 'preserve-3d',
                      willChange: 'transform',
                      boxShadow: isMobile
                        ? '0 12px 40px rgba(0,0,0,0.35)'
                        : (!tilt.isHovering
                          ? '0 10px 30px rgba(0,0,0,0.3)'
                          : `${-tilt.rotateY * 1.5}px ${tilt.rotateX * 1.5}px 40px rgba(0,0,0,0.4), ${-tilt.rotateY * 0.5}px ${tilt.rotateX * 0.5}px 15px rgba(0,0,0,0.2)`),
                      borderRadius: '12px',
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
                      {/* Base card art — scaled 1080px card to fit display size */}
                      <div
                        style={{
                          width: '1080px',
                          height: '1080px',
                          // Scale: displayW / innerCardW (641px)
                          // Desktop 374px: 0.5834, Mobile 300px: 0.468, Mobile 280px: 0.437
                          transform: isMobile ? 'scale(0.468)' : 'scale(0.5834)',
                          transformOrigin: 'top left',
                          position: 'absolute',
                          // Offset = -innerCardLeft * (displayW / innerCardW)
                          left: isMobile ? '-103px' : '-128px',
                          top: isMobile ? '-36px' : '-45px',
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
          </div>
        </div>

        {/* Tagline text — right-aligned */}
        <p
          style={{
            position: 'relative',
            fontFamily: 'Serrif, serif',
            fontSize: isMobile ? '14px' : '18px',
            color: rt.headline,
            maxWidth: '1200px',
            width: '100%',
            textAlign: isMobile ? 'center' : 'right',
            marginTop: isMobile ? '16px' : '24px',
            opacity: heroAnimStage === 'card-in' ? 1 : 0,
            transform: heroAnimStage === 'card-in' ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s',
          }}
        >
          {roleContent.tagline}
        </p>

        {/* Flip hint (desktop only — card not in hero on mobile) */}
        {!isMobile && (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              marginTop: '64px',
              opacity: heroAnimStage === 'card-in' ? 1 : 0,
              transition: 'opacity 0.6s ease-out 0.3s',
            }}
          >
            <p
              style={{
                fontFamily: 'SaansMono, monospace',
                fontSize: '12px',
                color: 'rgba(230,230,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              Click card to flip
            </p>
          </div>
        )}

        {/* Loading indicator */}
        {isGeneratingImage && (
          <div style={{ position: 'relative', textAlign: 'center', marginTop: '16px' }}>
            <div className="inline-flex items-center gap-2 text-[#E6E6FF]/70">
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
          <div style={{ position: 'relative', textAlign: 'center', marginTop: '16px' }}>
            <p className="text-red-400 text-sm mb-2">{imageError}</p>
            <button
              onClick={() => results && generateCardImage(results)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Scroll chevron indicator (desktop only) */}
        {!isMobile && (
          <div
            style={{
              position: 'relative',
              marginTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              opacity: heroAnimStage === 'card-in' ? 0.7 : 0,
              transition: 'opacity 0.6s ease-out 0.5s',
              animation: 'scrollChevronBounce 2s ease-in-out infinite',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M6 9L12 15L18 9" stroke={rt.body} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ marginTop: '-20px' }}>
              <path d="M6 9L12 15L18 9" stroke={rt.body} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* Sticky archetype title banner */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: rt.bg,
          padding: isMobile ? '48px 16px 8px' : '80px 24px 16px',
          overflow: 'visible',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {isMobile ? (
            /* On mobile: compact text-based archetype header */
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'SaansMono, monospace',
                  fontSize: '10px',
                  color: rt.headline,
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  opacity: 0.7,
                }}
              >
                The
              </span>
              <span
                style={{
                  fontFamily: 'Knockout-91, Impact, sans-serif',
                  fontSize: '32px',
                  color: rt.headline,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  lineHeight: 1,
                }}
              >
                {archetype.shortName}
              </span>
            </div>
          ) : (
            <img
              src={`/headers/card-title-${archetype.id}.svg`}
              alt={`The ${archetype.name}`}
              style={{ width: '100%', height: 'auto' }}
              onError={(e) => {
                e.currentTarget.src = `/headers/the-${archetype.id}-header.svg`;
              }}
            />
          )}
        </div>
      </div>

      {/* Content below hero — Two-column layout */}
      <div className="px-4 sm:px-10 py-8 sm:py-16" style={{ position: 'relative' }}>
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row gap-6">

          {/* ── Left Column (66%) — on mobile, appears AFTER the sidebar ── */}
          <div className="w-full md:w-2/3 order-2 md:order-1">
            <div
              className="rounded-3xl p-6 sm:p-8 space-y-8"
              style={{
                backgroundColor: rt.cardBg,
                border: `1.5px solid ${cardBorder}`,
              }}
            >
              {/* What You're Great At + Level Up Zone — side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={rt.headline} strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span
                      className="text-[10px] uppercase tracking-[0.15em] font-semibold"
                      style={{ fontFamily: 'SaansMono, monospace', color: rt.headline }}
                    >
                      What You&apos;re Great At
                    </span>
                  </div>
                  <p
                    className="text-[#E6E6FF] text-sm leading-relaxed"
                    style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}
                  >
                    {roleContent.winningPlay}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={rt.headline} strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span
                      className="text-[10px] uppercase tracking-[0.15em] font-semibold"
                      style={{ fontFamily: 'SaansMono, monospace', color: rt.headline }}
                    >
                      Level Up Zone
                    </span>
                  </div>
                  <p
                    className="text-[#E6E6FF] text-sm leading-relaxed"
                    style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}
                  >
                    {roleContent.whereToFocus}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: dividerColor }} />

              {/* Your Training Playbook */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={rt.headline} strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span
                    className="text-[10px] uppercase tracking-[0.15em] font-semibold"
                    style={{ fontFamily: 'SaansMono, monospace', color: rt.headline }}
                  >
                    Your Training Playbook
                  </span>
                </div>
                <p
                  className="text-[#E6E6FF]/70 text-sm mb-6"
                  style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}
                >
                  Resources from AirOps that will help you level up.{' '}
                  <a href="https://www.airops.com/cohort" target="_blank" rel="noopener noreferrer" className="underline text-[#E6E6FF]">
                    Enroll in the Content Engineering Cohort.
                  </a>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {roleContent.resources.map((resource, i) => {
                    const placeholderColors = [rt.cardBg, cardInner, rt.cardBg];
                    return (
                      <a
                        key={i}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                        style={{ border: `1px solid ${dividerColor}` }}
                      >
                        <div
                          className="flex items-center justify-center relative overflow-hidden"
                          style={{ backgroundColor: placeholderColors[i % 3], aspectRatio: '16 / 9' }}
                        >
                          {resource.ogImage && (
                            <img src={resource.ogImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          )}
                          <span
                            className="absolute top-2 left-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold"
                            style={{ fontFamily: 'SaansMono, monospace', backgroundColor: hexToRgba(cardInner, 0.85), color: rt.headline }}
                          >
                            {resource.type}
                          </span>
                        </div>
                        <div className="p-4" style={{ backgroundColor: cardInner }}>
                          <p className="text-[#E6E6FF] font-medium text-sm" style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}>
                            {resource.title}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: dividerColor }} />

              {/* Next Steps */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-[10px] uppercase tracking-[0.15em] font-semibold"
                    style={{ fontFamily: 'SaansMono, monospace', color: rt.headline }}
                  >
                    &gt;&gt; Next Steps
                  </span>
                </div>
                <h3
                  className="text-[#E6E6FF] text-2xl sm:text-3xl leading-tight mb-4"
                  style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}
                >
                  You&apos;re ready to play ball.<br />
                  Get started with AirOps today.
                </h3>
                <p
                  className="text-[#E6E6FF]/60 text-sm mb-8"
                  style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}
                >
                  {roleContent.nextStepsCopy}
                </p>
                <a
                  href={roleContent.levelUpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-full text-base font-medium transition-colors hover:bg-[#F5F5F5] active:scale-[0.98]"
                  style={{
                    fontFamily: 'Saans, sans-serif',
                    background: rt.secondaryBtn,
                    color: '#FFFFFF',
                    border: `1.5px solid ${hexToRgba(rt.body, 0.2)}`,
                    minHeight: '48px',
                  }}
                >
                  {results.role === 'ic' ? 'Join the Cohort' : 'Book a Demo'} &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* ── Right Column (34%) — sticky card sidebar. On mobile, appears FIRST (share section) ── */}
          <div className="w-full md:w-1/3 order-1 md:order-2">
            <div className="md:sticky md:top-[200px] space-y-5" style={{ maxHeight: isMobile ? 'none' : 'calc(100vh - 220px)', overflowY: isMobile ? 'visible' : 'auto' }}>
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
                  // On mobile, hide the sidebar card — it's already in the hero
                  ...(isMobile ? { display: 'none' } : {}),
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

              {/* Archetype name + bullet stats */}
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.2em] mb-1"
                  style={{ fontFamily: 'SaansMono, monospace', color: rt.headline }}
                >
                  The
                </p>
                <h3
                  className="text-[#E6E6FF] text-2xl font-bold uppercase tracking-wide mb-5"
                  style={{ fontFamily: 'Knockout-91, Impact, sans-serif' }}
                >
                  {archetype.shortName}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-1" style={{ fontFamily: 'SaansMono, monospace', color: rt.headline }}>
                      Most Likely To:
                    </p>
                    <p className="text-[#E6E6FF] text-sm" style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}>
                      {results.bullets.mostLikelyTo}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-1" style={{ fontFamily: 'SaansMono, monospace', color: rt.headline }}>
                      Typically Spending Time:
                    </p>
                    <p className="text-[#E6E6FF] text-sm" style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}>
                      {results.bullets.typicallySpending}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-1" style={{ fontFamily: 'SaansMono, monospace', color: rt.headline }}>
                      Favorite Phrase:
                    </p>
                    <p className="text-[#E6E6FF] text-sm" style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}>
                      &ldquo;{results.bullets.favoritePhrase}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Share section — LinkedIn */}
              <div>
                <p
                  className="text-xl font-semibold mb-2"
                  style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif', color: rt.headline }}
                >
                  Share your results on LinkedIn:
                </p>
                <div className="flex flex-col gap-3">
                  {/* Download card + copy post text — single button */}
                  <button
                    onClick={async () => {
                      // 1. Copy share text to clipboard
                      navigator.clipboard.writeText(shareBody);
                      setLinkedinCopied(true);
                      setTimeout(() => setLinkedinCopied(false), 4000);

                      // 2. Download the card image
                      if (downloadRef.current) {
                        try {
                          const canvas = await html2canvas(downloadRef.current, {
                            scale: 3,
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: '#000000',
                            width: 1200,
                            height: 630,
                          });
                          canvas.toBlob((blob) => {
                            if (!blob) return;
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'airops-marketype-card.png';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }, 'image/png');
                        } catch {
                          const imageUrl = ogImageUrl || shareableCardUrl;
                          if (imageUrl) window.open(imageUrl, '_blank');
                        }
                      }

                      // 3. Open LinkedIn compose after short delay
                      setTimeout(() => {
                        window.open(linkedinShareUrl, '_blank');
                      }, 500);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 rounded-full font-semibold transition-opacity cursor-pointer hover:opacity-90 active:scale-[0.98]"
                    style={{ background: '#00FF64', color: '#000D05', minHeight: '48px', fontSize: isMobile ? '15px' : '14px' }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {linkedinCopied ? 'Card downloaded & post copied!' : 'Download your player card'}
                  </button>
                  <p className="text-[#B3B3D6] text-sm" style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}>
                    Click button above to download your card, and copy your share post. Paste into LinkedIn, upload your unique card image, and make it your own!
                  </p>
                </div>
              </div>

              {/* Share on X + Challenge */}
              <div className="flex flex-col gap-3">
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 rounded-full font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#00FF64', color: '#000D05', minHeight: '48px', fontSize: isMobile ? '15px' : '14px' }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Share on X
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('https://www.airops.com/win');
                    alert('Link copied!');
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 rounded-full font-semibold transition-opacity cursor-pointer hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#00FF64', color: '#000D05', minHeight: '48px', fontSize: isMobile ? '15px' : '14px' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Challenge your team
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile: static card at bottom of content */}
      {isMobile && (
        <div
          style={{
            background: rt.bg,
            padding: '40px 16px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <p
            style={{
              fontFamily: 'SaansMono, monospace',
              fontSize: '10px',
              color: rt.headline,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              opacity: 0.7,
            }}
          >
            Your Player Card
          </p>
          <div
            onClick={handleFlip}
            style={{
              width: 'min(80vw, 320px)',
              aspectRatio: '374 / 540',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '12px',
              cursor: 'pointer',
              transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
              transition: 'transform 0.7s ease-in-out',
              transformStyle: 'preserve-3d',
              boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
            }}
          >
            {/* Front face */}
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
              <div
                style={{
                  width: '1080px',
                  height: '1080px',
                  transform: 'scale(0.499)',
                  transformOrigin: 'top left',
                  position: 'absolute',
                  left: '-110px',
                  top: '-38px',
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
            {/* Back face */}
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
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
          <p
            style={{
              fontFamily: 'SaansMono, monospace',
              fontSize: '11px',
              color: hexToRgba(rt.body, 0.5),
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            Tap to flip
          </p>
        </div>
      )}

      {/* Recent Player Cards Gallery */}
      {recentCards.length > 0 && (
        <div
          ref={galleryRef}
          style={{
            background: cardInner,
            padding: isMobile ? '48px 0' : '80px 0',
            overflow: 'hidden',
          }}
        >
          <div className="max-w-[1200px] mx-auto px-6 mb-8">
            <p
              className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-3"
              style={{ fontFamily: 'SaansMono, monospace', color: rt.headline }}
            >
              Recent Players
            </p>
            <h3
              className="text-[#E6E6FF] text-2xl sm:text-3xl leading-tight"
              style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}
            >
              See who else is playing
            </h3>
          </div>
          <div
            className="flex gap-5 px-6 overflow-x-auto pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style>{`.gallery-scroll::-webkit-scrollbar { display: none; }`}</style>
            {recentCards.map((card, i) => (
              <a
                key={card.userId}
                href={`/results?userId=${card.userId}`}
                className="group flex-shrink-0"
                style={{
                  opacity: galleryVisible ? 1 : 0,
                  transform: galleryVisible ? 'translateY(0)' : 'translateY(40px)',
                  transition: `opacity 0.6s ease-out ${i * 0.08}s, transform 0.6s ease-out ${i * 0.08}s`,
                }}
              >
                <div
                  style={{
                    width: isMobile ? '160px' : '220px',
                    height: isMobile ? '231px' : '318px',
                    perspective: '800px',
                  }}
                >
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{
                      width: '100%',
                      height: '100%',
                      transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
                      transformStyle: 'preserve-3d',
                    }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - rect.left) / rect.width;
                      const y = (e.clientY - rect.top) / rect.height;
                      e.currentTarget.style.transform = `rotateX(${(0.5 - y) * 15}deg) rotateY(${(x - 0.5) * 15}deg)`;
                      e.currentTarget.style.boxShadow = `${-(x - 0.5) * 20}px ${(0.5 - y) * 20}px 30px rgba(0,0,0,0.4)`;
                      const holo = e.currentTarget.querySelector('[data-holo]') as HTMLElement;
                      if (holo) {
                        holo.style.opacity = '1';
                        holo.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.3), transparent 50%), linear-gradient(${105 + (x - 0.5) * 60}deg, transparent 20%, rgba(0,255,100,0.15) 40%, rgba(100,200,255,0.15) 50%, rgba(255,100,200,0.1) 60%, transparent 80%)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                      const holo = e.currentTarget.querySelector('[data-holo]') as HTMLElement;
                      if (holo) holo.style.opacity = '0';
                    }}
                  >
                    {/* Mini ShareCard */}
                    <div
                      style={{
                        width: '1080px',
                        height: '1080px',
                        transform: isMobile ? 'scale(0.249)' : 'scale(0.343)',
                        transformOrigin: 'top left',
                        position: 'absolute',
                        left: isMobile ? '-55px' : '-76px',
                        top: isMobile ? '-19px' : '-26px',
                      }}
                    >
                      <ShareCard
                        firstName={card.firstName}
                        lastName={card.lastName}
                        company={card.company}
                        archetypeName={card.archetypeName}
                        shortName={card.shortName}
                        archetypeId={card.archetypeId as ArchetypeId}
                        headshotUrl={card.stippleImageUrl || card.headshotUrl}
                        mostLikelyTo={card.mostLikelyTo}
                        typicallySpending={card.typicallySpending}
                        favoritePhrase={card.favoritePhrase}
                        transparent
                      />
                    </div>
                    {/* Holographic overlay */}
                    <div
                      data-holo
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        transition: 'opacity 0.3s ease-out',
                        pointerEvents: 'none',
                        zIndex: 2,
                        borderRadius: '12px',
                      }}
                    />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Take the quiz CTA section */}
      <div
        style={{
          background: rt.cardBg,
          padding: isMobile ? '80px 16px 60px' : '160px 24px 120px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'SerrifVF, Serrif, Georgia, serif',
            fontSize: 'clamp(40px, 6vw, 72px)',
            color: rt.headline,
            marginBottom: '16px',
          }}
        >
          Take the quiz
        </h2>
        <p
          className="text-[#E6E6FF]/60 text-sm mb-8 max-w-md mx-auto"
          style={{ fontFamily: 'SerrifVF, Serrif, Georgia, serif' }}
        >
          Body text which supports this component&apos;s goal. Interested in registering straight to the platform?{' '}
          <a href="https://app.airops.com" target="_blank" rel="noopener noreferrer" className="underline text-[#E6E6FF]">
            click here
          </a>
        </p>
        <a
          href="/quiz"
          className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full text-base font-medium transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{
            fontFamily: 'Saans, sans-serif',
            background: '#00FF64',
            color: '#000D05',
          }}
        >
          Take the quiz &rarr;
        </a>
      </div>

      {/* Footer */}
      <footer style={{ background: cardInner, padding: isMobile ? '40px 16px 24px' : '60px 24px 32px', color: rt.body }}>
        <div className="max-w-[1200px] mx-auto">
          {/* Top nav */}
          <div className="flex gap-6 mb-8 text-sm" style={{ fontFamily: 'Saans, sans-serif' }}>
            <a href="https://www.airops.com/platform" className="hover:underline">Platform</a>
            <a href="https://www.airops.com/careers" className="hover:underline">Careers</a>
            <a href="https://www.airops.com/resources" className="hover:underline">Resources</a>
          </div>
          <div style={{ height: '1px', background: cardBorder, marginBottom: '32px' }} />
          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 mb-16 text-xs" style={{ fontFamily: 'Saans, sans-serif', color: rt.body }}>
            <div>
              <p className="font-semibold mb-3 text-[#E6E6FF]">Product</p>
              <div className="space-y-2 text-[#E6E6FF]/60">
                <a href="https://www.airops.com/insights" className="block hover:underline">Insights</a>
                <a href="https://www.airops.com/actions" className="block hover:underline">Actions</a>
                <a href="https://www.airops.com/platform" className="block hover:underline">Platform</a>
                <a href="https://www.airops.com/grids" className="block hover:underline">Grids</a>
                <a href="https://www.airops.com/workflows" className="block hover:underline">Workflows</a>
                <a href="https://www.airops.com/knowledge-bases" className="block hover:underline">Knowledge Bases</a>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-3 text-[#E6E6FF]">Solutions</p>
              <div className="space-y-2 text-[#E6E6FF]/60">
                <a href="https://www.airops.com/solutions/content-seo" className="block hover:underline">Content & SEO</a>
                <a href="https://www.airops.com/solutions/teams" className="block hover:underline">Teams</a>
                <a href="https://www.airops.com/solutions/marketing-agencies" className="block hover:underline">Marketing Agencies</a>
                <a href="https://www.airops.com/solutions/content-refresh" className="block hover:underline">Content Refresh</a>
                <a href="https://www.airops.com/solutions/content-creation" className="block hover:underline">Content Creation</a>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-3 text-[#E6E6FF]">General</p>
              <div className="space-y-2 text-[#E6E6FF]/60">
                <a href="https://www.airops.com/pricing" className="block hover:underline">Pricing</a>
                <a href="https://www.airops.com/careers" className="block hover:underline">Careers</a>
                <a href="https://docs.airops.com" className="block hover:underline">Documentation</a>
                <a href="https://www.airops.com/affiliate" className="block hover:underline">Affiliate</a>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-3 text-[#E6E6FF]">Resources</p>
              <div className="space-y-2 text-[#E6E6FF]/60">
                <a href="https://www.airops.com/academy" className="block hover:underline">Academy</a>
                <a href="https://www.airops.com/blog" className="block hover:underline">Blog</a>
                <a href="https://www.airops.com/research" className="block hover:underline">AirOps Research</a>
                <a href="https://www.airops.com/aeo-analysis" className="block hover:underline">AEO Analysis</a>
                <a href="https://www.airops.com/growth-plays" className="block hover:underline">AI Growth Plays</a>
                <a href="https://www.airops.com/search-hub" className="block hover:underline">AI Search Hub</a>
                <a href="https://www.airops.com/prompts" className="block hover:underline">Prompts</a>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-3 text-[#E6E6FF]">Support</p>
              <div className="space-y-2 text-[#E6E6FF]/60">
                <a href="https://www.airops.com/contact" className="block hover:underline">Talk to Us</a>
                <a href="https://community.airops.com" className="block hover:underline">Community</a>
                <a href="https://www.airops.com/careers" className="block hover:underline">AirOps Job Board</a>
                <a href="https://www.airops.com/experts" className="block hover:underline">Experts</a>
              </div>
            </div>
          </div>
          {/* Large airOps logo */}
          <div className="mb-6">
            <img
              src="/images/airops-logo.svg"
              alt="airOps"
              style={{ width: '100%', maxWidth: '100%', height: 'auto', opacity: 0.9 }}
              onError={(e) => {
                // Fallback: render as text if SVG doesn't exist
                const el = e.currentTarget;
                el.style.display = 'none';
                const text = document.createElement('span');
                text.textContent = 'airOps';
                text.style.cssText = `font-family: Knockout-91, Impact, sans-serif; font-size: clamp(80px, 15vw, 200px); color: ${rt.body}; display: block;`;
                el.parentElement?.appendChild(text);
              }}
            />
          </div>
          {/* Bottom links */}
          <div className="flex gap-6 text-[10px] uppercase tracking-[0.15em]" style={{ fontFamily: 'SaansMono, monospace', color: rt.headline }}>
            <a href="https://www.airops.com/privacy" className="hover:underline">Privacy Policy</a>
            <a href="https://www.airops.com/careers" className="hover:underline">Careers</a>
            <a href="https://www.airops.com/resources" className="hover:underline">Resources</a>
          </div>
        </div>
      </footer>

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
