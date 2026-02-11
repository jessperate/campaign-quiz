"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  roleQuestion,
  getQuestionsForRole,
  calculateArchetype,
  type Role,
  type ArchetypeId,
} from "@/lib/quiz-data";
import { ShareCard } from "@/components/Results/ShareCard";
import { archetypes, getBullets } from "@/lib/archetypes";

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [role, setRole] = useState<Role | null>(null);
  const [questions, setQuestions] = useState([roleQuestion]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    title: "",
    company: "",
    wantsDemo: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [headshot, setHeadshot] = useState<File | null>(null);
  const [headshotPreview, setHeadshotPreview] = useState<string | null>(null);
  const stipplePromise = useRef<Promise<string | null> | null>(null);
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0, pointerX: 0, pointerY: 0, isHovering: false });
  const cardTiltRef = useRef<HTMLDivElement>(null);

  const handleCardTiltMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardTiltRef.current) return;
    const rect = cardTiltRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 30;
    const rotateX = (0.5 - y) * 20;
    setCardTilt({ rotateX, rotateY, pointerX: x, pointerY: y, isHovering: true });
  }, []);

  const handleCardTiltLeave = useCallback(() => {
    setCardTilt({ rotateX: 0, rotateY: 0, pointerX: 0.5, pointerY: 0.5, isHovering: false });
  }, []);

  useEffect(() => {
    if (role) {
      setQuestions([roleQuestion, ...getQuestionsForRole(role)]);
    }
  }, [role]);

  const totalQuestions = 7;
  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (answerId: string) => {
    setSelectedAnswer(answerId);

    // Auto-advance after a short delay
    setTimeout(() => {
      const newAnswers = { ...answers, [currentQuestion.id]: answerId };
      setAnswers(newAnswers);

      if (currentQuestion.id === "q1") {
        setRole(answerId as Role);
      }

      if (currentQuestionIndex === totalQuestions - 1) {
        const finalRole = role || (answerId as Role);
        const archetype = calculateArchetype(newAnswers, finalRole);
        console.log("Quiz complete - storing data:", { archetype, finalRole, newAnswers });
        sessionStorage.setItem("quizAnswers", JSON.stringify(newAnswers));
        sessionStorage.setItem("quizRole", finalRole);
        sessionStorage.setItem("quizArchetype", archetype);
        setShowForm(true);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      }
    }, 300);
  };

  const handleHeadshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeadshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setHeadshotPreview(base64);

        // Start stipple generation immediately in the background
        stipplePromise.current = fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoBase64: base64, userName: '', archetype: '', tagline: '' }),
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => data?.imageUrl || null)
          .catch(() => null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Also keep sessionStorage as fallback
    const dataToStore = {
      ...formData,
      headshotPreview: headshotPreview,
    };
    sessionStorage.setItem("quizFormData", JSON.stringify(dataToStore));

    // Upload headshot to blob if provided, then submit through API
    // Also resolve the pre-generated stipple if ready
    let headshotBlobUrl = "";
    let stippleBlobUrl = "";

    if (headshotPreview) {
      // Upload headshot and resolve stipple in parallel
      const headshotUpload = fetch("/api/upload-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: headshotPreview,
          uniqueId: `headshot-${Date.now()}`,
        }),
      })
        .then(res => res.json())
        .then(data => { if (data.url) headshotBlobUrl = data.url; })
        .catch(err => console.warn("Failed to upload headshot:", err));

      const stippleUpload = stipplePromise.current
        ? stipplePromise.current.then(async (stippleBase64) => {
            if (!stippleBase64) return;
            try {
              const res = await fetch("/api/upload-card", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  imageBase64: stippleBase64,
                  uniqueId: `stipple-${Date.now()}`,
                }),
              });
              const data = await res.json();
              if (data.url) stippleBlobUrl = data.url;
            } catch (err) {
              console.warn("Failed to upload stipple:", err);
            }
          })
        : Promise.resolve();

      await Promise.all([headshotUpload, stippleUpload]);
    }

    // Parse name into first/last
    const nameParts = (formData.fullName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Build answer array from stored answers (q2-q6 → question 1-5)
    const quizRole = role || sessionStorage.getItem("quizRole") as Role;
    const answerArray = [];
    for (let i = 2; i <= 7; i++) {
      const ans = answers[`q${i}`];
      if (ans) {
        answerArray.push({ question: i - 1, answer: ans });
      }
    }

    try {
      const res = await fetch("/api/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: quizRole,
          answers: answerArray,
          firstName,
          lastName,
          title: formData.title || "",
          company: formData.company || "",
          email: formData.email,
          headshotUrl: headshotBlobUrl,
          stippleImageUrl: stippleBlobUrl || undefined,
          wantsDemo: formData.wantsDemo || false,
        }),
      });
      const data = await res.json();

      if (data.success && data.userId) {
        router.push(`/results?userId=${data.userId}`);
        return;
      }
    } catch (err) {
      console.warn("API submit failed, falling back to sessionStorage:", err);
    }

    // Fallback to old sessionStorage flow
    router.push("/results");
  };

  if (!currentQuestion && !showForm) {
    return null;
  }

  // Determine subtitle based on question
  const getSubtitle = () => {
    if (currentQuestionIndex === 0) return "First, let's set the field.";
    return `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;
  };

  // Form view after quiz completion
  if (showForm) {
    // Get archetype for the preview card
    const previewArchetypeId = sessionStorage.getItem("quizArchetype") as ArchetypeId | null;
    const previewArchetype = previewArchetypeId ? archetypes[previewArchetypeId] : null;
    const previewBullets = previewArchetype && role
      ? getBullets(previewArchetype, role)
      : { mostLikelyTo: "???", typicallySpending: "???", favoritePhrase: "???" };

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

        <div className="relative min-h-screen flex flex-col">
          <main className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              {/* Form column */}
              <div className="max-w-xl text-center lg:text-left flex-1">
                <p className="text-[#0D3D1F]/70 text-lg md:text-xl mb-4" style={{ fontFamily: 'Serrif, serif' }}>
                  Almost there!
                </p>

                <h1 className="text-[#0D3D1F] text-[32px] md:text-[42px] lg:text-[48px] leading-[1.1] mb-8" style={{ fontFamily: 'Serrif, serif' }}>
                  Tell us about yourself to build your player card.
                </h1>

                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                  {/* Work email - required */}
                  <input
                    type="email"
                    placeholder="Work email *"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 rounded-full bg-white/80 backdrop-blur-sm text-[#0D3D1F] placeholder-[#0D3D1F]/50 focus:outline-none focus:ring-2 focus:ring-[#0D3D1F]/30"
                  />

                  {/* Full name */}
                  <input
                    type="text"
                    placeholder="Full name *"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-5 py-4 rounded-full bg-white/80 backdrop-blur-sm text-[#0D3D1F] placeholder-[#0D3D1F]/50 focus:outline-none focus:ring-2 focus:ring-[#0D3D1F]/30"
                  />

                  {/* Title */}
                  <input
                    type="text"
                    placeholder="Title *"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-5 py-4 rounded-full bg-white/80 backdrop-blur-sm text-[#0D3D1F] placeholder-[#0D3D1F]/50 focus:outline-none focus:ring-2 focus:ring-[#0D3D1F]/30"
                  />

                  {/* Company */}
                  <input
                    type="text"
                    placeholder="Company *"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-5 py-4 rounded-full bg-white/80 backdrop-blur-sm text-[#0D3D1F] placeholder-[#0D3D1F]/50 focus:outline-none focus:ring-2 focus:ring-[#0D3D1F]/30"
                  />

                  {/* Headshot upload */}
                  <div className="flex items-center gap-4">
                    <label className="flex-1 px-5 py-4 rounded-full bg-white/80 backdrop-blur-sm text-[#0D3D1F]/50 cursor-pointer hover:bg-white transition-colors text-left">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeadshotChange}
                        className="hidden"
                      />
                      {headshotPreview ? "Photo uploaded ✓" : "Upload headshot (optional)"}
                    </label>
                    {headshotPreview && (
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white">
                        <img src={headshotPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Demo checkbox */}
                  <label className="flex items-center gap-3 px-5 py-4 rounded-full bg-white/80 backdrop-blur-sm cursor-pointer hover:bg-white transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.wantsDemo}
                      onChange={(e) => setFormData({ ...formData, wantsDemo: e.target.checked })}
                      className="w-5 h-5 rounded accent-[#0D3D1F]"
                    />
                    <span className="text-[#0D3D1F]">I'd like to book a demo</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 mt-4 rounded-full bg-[#0D3D1F] text-white font-semibold text-lg hover:bg-[#0D3D1F]/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Loading..." : "See my results"}
                  </button>
                </form>

                <p className="text-[#0D3D1F]/50 text-sm mt-6">
                  We'll send you a copy of your results and occasional content tips.
                </p>
              </div>

              {/* Preview card column — obfuscated with interactive holographic effect */}
              <div className="hidden lg:block relative flex-shrink-0" style={{ perspective: '1000px' }}>
                <div
                  ref={cardTiltRef}
                  onMouseMove={handleCardTiltMove}
                  onMouseLeave={handleCardTiltLeave}
                  style={{
                    width: '320px',
                    height: '462px',
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transform: `rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
                    transition: !cardTilt.isHovering ? 'transform 0.5s ease-out, box-shadow 0.5s ease-out' : 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    boxShadow: !cardTilt.isHovering
                      ? '0 20px 60px rgba(0,0,0,0.3)'
                      : `${-cardTilt.rotateY * 1.5}px ${cardTilt.rotateX * 1.5}px 40px rgba(0,0,0,0.4), ${-cardTilt.rotateY * 0.5}px ${cardTilt.rotateX * 0.5}px 15px rgba(0,0,0,0.2)`,
                  }}
                >
                  {/* Scaled-down ShareCard with placeholder data */}
                  <div
                    style={{
                      width: '1080px',
                      height: '1080px',
                      transform: 'scale(0.5)',
                      transformOrigin: 'top left',
                      position: 'absolute',
                      left: '-110px',
                      top: '-38px',
                    }}
                  >
                    <ShareCard
                      firstName="Your"
                      lastName="Name"
                      company="Your Company"
                      archetypeName={previewArchetype?.name || "???"}
                      shortName={previewArchetype?.shortName || "???"}
                      archetypeId={previewArchetypeId || undefined}
                      mostLikelyTo={previewBullets.mostLikelyTo}
                      typicallySpending={previewBullets.typicallySpending}
                      favoritePhrase={previewBullets.favoritePhrase}
                      transparent
                    />
                  </div>

                  {/* Frosted blur overlay to obfuscate content */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backdropFilter: 'blur(6px)',
                      WebkitBackdropFilter: 'blur(6px)',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      zIndex: 3,
                    }}
                  />

                  {/* Holographic pattern layer — mouse-tracked */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      overflow: 'hidden',
                      mixBlendMode: 'multiply',
                      opacity: cardTilt.isHovering ? 0.4 : 0,
                      transition: 'opacity 0.3s ease-out',
                      maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\'%3E%3Crect width=\'4\' height=\'4\' fill=\'white\'/%3E%3Crect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'white\'/%3E%3C/svg%3E")',
                      maskSize: '6px 6px',
                      WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\'%3E%3Crect width=\'4\' height=\'4\' fill=\'white\'/%3E%3Crect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'white\'/%3E%3C/svg%3E")',
                      WebkitMaskSize: '6px 6px',
                      filter: 'saturate(2)',
                      zIndex: 4,
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
                        scale: `${Math.min(1, 0.15 + cardTilt.pointerX * 0.25)}`,
                        translate: `clamp(-10%, ${-10 + cardTilt.pointerX * 10}%, 10%) ${Math.max(0, cardTilt.pointerY * -1 * 10)}%`,
                        transition: !cardTilt.isHovering ? 'all 0.3s ease-out' : 'none',
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
                        scale: `${Math.min(1, 0.15 + cardTilt.pointerX * -0.65)}`,
                        translate: `clamp(-10%, ${10 + cardTilt.pointerX * 10}%, 10%) ${Math.min(0, cardTilt.pointerY * -10)}%`,
                        transition: !cardTilt.isHovering ? 'all 0.3s ease-out' : 'none',
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
                      opacity: cardTilt.isHovering ? 0.35 : 0,
                      transition: 'opacity 0.3s ease-out',
                      maskImage: 'repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)',
                      maskSize: '12px 12px',
                      WebkitMaskImage: 'repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)',
                      WebkitMaskSize: '12px 12px',
                      filter: 'saturate(0.9) contrast(1.1) brightness(1.2)',
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
                        scale: `${Math.min(1, 0.15 + cardTilt.pointerX * 0.25)}`,
                        translate: `clamp(-10%, ${-10 + cardTilt.pointerX * 10}%, 10%) ${Math.max(0, cardTilt.pointerY * -1 * 10)}%`,
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
                        scale: `${Math.min(1, 0.15 + cardTilt.pointerX * -0.65)}`,
                        translate: `clamp(-10%, ${10 + cardTilt.pointerX * 10}%, 10%) ${Math.min(0, cardTilt.pointerY * -10)}%`,
                      }}
                    />
                  </div>

                  {/* Spotlight following pointer */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      background: cardTilt.isHovering
                        ? `radial-gradient(circle at ${cardTilt.pointerX * 100}% ${cardTilt.pointerY * 100}%, rgba(255,255,255,0.2), transparent 50%)`
                        : 'none',
                      zIndex: 6,
                      borderRadius: '12px',
                      transition: !cardTilt.isHovering ? 'opacity 0.3s ease-out' : 'none',
                      opacity: cardTilt.isHovering ? 1 : 0,
                    }}
                  />

                  {/* Edge glare */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      background: cardTilt.isHovering
                        ? `linear-gradient(${105 + cardTilt.rotateY * 2}deg, transparent 30%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 70%)`
                        : 'none',
                      zIndex: 7,
                      borderRadius: '12px',
                      opacity: cardTilt.isHovering ? 1 : 0,
                      transition: !cardTilt.isHovering ? 'opacity 0.3s ease-out' : 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </main>

          {/* Progress dots - all filled */}
          <div className="flex justify-center gap-2 pb-8">
            {Array.from({ length: totalQuestions }).map((_, index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-full bg-[#0D3D1F]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

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

      <div className="relative min-h-screen flex flex-col">
        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 pt-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Subtitle */}
            <p className="text-[#0D3D1F]/70 text-lg md:text-xl mb-4" style={{ fontFamily: 'Serrif, serif' }}>
              {getSubtitle()}
            </p>

            {/* Question */}
            <h1 className="text-[#0D3D1F] text-[48px] md:text-[72px] lg:text-[88px] leading-[1.1] mb-12" style={{ fontFamily: 'Serrif, serif' }}>
              {currentQuestion.text}
            </h1>

            {/* Answer options */}
            <div className="flex flex-col items-center gap-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(option.id)}
                  className={`
                    w-full max-w-2xl px-6 py-4 rounded-full text-left
                    transition-all duration-200 ease-out
                    ${selectedAnswer === option.id
                      ? 'bg-[#0D3D1F] text-white'
                      : 'bg-white/80 backdrop-blur-sm text-[#0D3D1F] hover:bg-white hover:shadow-lg'
                    }
                  `}
                >
                  <span className="text-base md:text-lg">
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pb-8">
          {Array.from({ length: totalQuestions }).map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index <= currentQuestionIndex ? 'bg-[#0D3D1F]' : 'bg-[#0D3D1F]/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
