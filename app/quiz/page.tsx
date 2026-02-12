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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [headshot, setHeadshot] = useState<File | null>(null);
  const [headshotPreview, setHeadshotPreview] = useState<string | null>(null);
  const stipplePromise = useRef<Promise<string | null> | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0, pointerX: 0, pointerY: 0, isHovering: false });
  const cardTiltRef = useRef<HTMLDivElement>(null);
  const [previewCardIndex, setPreviewCardIndex] = useState(0);

  const PREVIEW_CARDS = [
    '/images/card-preview.svg',
    '/images/card-vision.svg',
    '/images/card-glue.svg',
    '/images/card-trendsetter.svg',
    '/images/card-craft.svg',
    '/images/card-gogoer.svg',
    '/images/card-hatcollector.svg',
    '/images/card-heart.svg',
  ];

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

  // Cycle preview cards after 3 seconds
  useEffect(() => {
    if (!showForm) return;
    let intervalId: NodeJS.Timeout;
    const timerId = setTimeout(() => {
      intervalId = setInterval(() => {
        setPreviewCardIndex(prev => (prev + 1) % PREVIEW_CARDS.length);
      }, 2000);
    }, 3000);
    return () => {
      clearTimeout(timerId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [showForm]);

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
        processPhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processPhoto = (base64: string) => {
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

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
      });
      streamRef.current = stream;
      setCameraOpen(true);
      // Attach stream to video element after render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch {
      alert('Could not access camera. Please check your browser permissions.');
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    // Center-crop to square, mirror horizontally for selfie
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    processPhoto(base64);
    closeCamera();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

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

    // Build answer array from stored answers (q2-q7 → question 1-6)
    const quizRole = role || sessionStorage.getItem("quizRole") as Role;
    const answerArray = [];
    for (let i = 2; i <= 7; i++) {
      const ans = answers[`q${i}`];
      if (ans) {
        answerArray.push({ question: i - 1, answer: ans });
      }
    }

    // Guard: ensure all 6 answers are present before submitting
    if (answerArray.length !== 6) {
      console.error("Missing answers: expected 6, got", answerArray.length, answers);
      setSubmitError("Some answers were lost. Please retake the quiz.");
      setIsSubmitting(false);
      return;
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

      // API returned an error — show it to the user
      console.error("Quiz submission error:", data.error);
      setSubmitError(data.error || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    } catch (err) {
      console.error("Quiz submission failed:", err);
      setSubmitError("Network error. Please check your connection and try again.");
      setIsSubmitting(false);
    }
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
    return (
      <div className="min-h-screen relative">
        {/* Full page background */}
        <div className="fixed inset-0 pointer-events-none">
          <Image
            src="/images/question-bg.svg"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative min-h-screen flex flex-col">
          <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
            <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              {/* Form column */}
              <div className="max-w-xl text-center lg:text-left flex-1">
                <p className="text-[#0D3D1F]/70 text-lg md:text-xl mb-4" style={{ fontFamily: 'Serrif, serif' }}>
                  Almost there!
                </p>

                <h1 className="text-[#0D3D1F] text-[26px] sm:text-[32px] md:text-[42px] lg:text-[48px] leading-[1.1] mb-6 sm:mb-8" style={{ fontFamily: 'Serrif, serif' }}>
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

                  {/* Headshot upload / camera */}
                  <div className="flex items-center gap-3">
                    <label className="flex-1 px-5 py-4 rounded-full bg-white/80 backdrop-blur-sm text-[#0D3D1F]/50 cursor-pointer hover:bg-white transition-colors text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeadshotChange}
                        className="hidden"
                      />
                      {headshotPreview ? "Photo added \u2713" : "Upload photo"}
                    </label>
                    <button
                      type="button"
                      onClick={openCamera}
                      className="flex-1 px-5 py-4 rounded-full bg-white/80 backdrop-blur-sm text-[#0D3D1F]/50 cursor-pointer hover:bg-white transition-colors text-center"
                    >
                      {headshotPreview ? "Retake" : "Take photo"}
                    </button>
                    {headshotPreview && (
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
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

                  {submitError && (
                    <p className="text-red-600 text-sm text-center bg-red-50 rounded-full px-5 py-3">
                      {submitError}
                    </p>
                  )}

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

              {/* Preview card column — cycling archetype cards */}
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
                    transform: `rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
                    transition: !cardTilt.isHovering ? 'transform 0.5s ease-out, box-shadow 0.5s ease-out' : 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                    boxShadow: !cardTilt.isHovering
                      ? '0 20px 60px rgba(0,0,0,0.3)'
                      : `${-cardTilt.rotateY * 1.5}px ${cardTilt.rotateX * 1.5}px 40px rgba(0,0,0,0.4), ${-cardTilt.rotateY * 0.5}px ${cardTilt.rotateX * 0.5}px 15px rgba(0,0,0,0.2)`,
                  }}
                >
                  {PREVIEW_CARDS.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: i === previewCardIndex ? 1 : 0,
                        transition: 'opacity 0.6s ease-in-out',
                      }}
                    />
                  ))}
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
          src="/images/question-bg.svg"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative min-h-screen flex flex-col">
        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 pt-16 sm:pt-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Subtitle */}
            <p className="text-[#0D3D1F]/70 text-lg md:text-xl mb-4" style={{ fontFamily: 'Serrif, serif' }}>
              {getSubtitle()}
            </p>

            {/* Question */}
            <h1 className="text-[#0D3D1F] text-[32px] sm:text-[48px] md:text-[72px] lg:text-[88px] leading-[1.1] mb-8 sm:mb-12" style={{ fontFamily: 'Serrif, serif' }}>
              {currentQuestion.text}
            </h1>

            {/* Answer options */}
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectAnswer(option.id)}
                  className={`
                    w-full max-w-2xl px-4 sm:px-6 py-3 sm:py-4 rounded-full text-left
                    transition-all duration-200 ease-out
                    ${selectedAnswer === option.id
                      ? 'bg-[#0D3D1F] text-white'
                      : 'bg-white/80 backdrop-blur-sm text-[#0D3D1F] hover:bg-white hover:shadow-lg'
                    }
                  `}
                >
                  <span className="text-sm sm:text-base md:text-lg">
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

      {/* Camera modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-black rounded-2xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-square object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-center gap-6 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <button
                type="button"
                onClick={closeCamera}
                className="px-6 py-3 rounded-full bg-white/20 text-white text-sm font-medium backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white border-4 border-white/50 hover:scale-105 transition-transform"
              />
              <div className="w-[76px]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
