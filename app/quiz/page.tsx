"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  roleQuestion,
  getQuestionsForRole,
  calculateArchetype,
  type Role,
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
    firstName: "",
    lastName: "",
    email: "",
    company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (role) {
      setQuestions([roleQuestion, ...getQuestionsForRole(role)]);
    }
  }, [role]);

  const totalQuestions = 5;
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
        const archetype = calculateArchetype(newAnswers, role || (answerId as Role));
        sessionStorage.setItem("quizAnswers", JSON.stringify(newAnswers));
        sessionStorage.setItem("quizRole", role || answerId);
        sessionStorage.setItem("quizArchetype", archetype);
        setShowForm(true);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      }
    }, 300);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Store form data in session storage
    sessionStorage.setItem("quizFormData", JSON.stringify(formData));

    // TODO: Send to backend/HubSpot in future phase

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
          <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-xl mx-auto text-center">
              <p className="text-[#0D3D1F]/70 text-lg md:text-xl mb-4" style={{ fontFamily: 'Serrif, serif' }}>
                Almost there!
              </p>

              <h1 className="text-[#0D3D1F] text-[36px] md:text-[48px] lg:text-[56px] leading-[1.1] mb-8" style={{ fontFamily: 'Serrif, serif' }}>
                Where should we send your results?
              </h1>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="First name"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="flex-1 px-5 py-4 rounded-full bg-white/80 backdrop-blur-sm text-[#0D3D1F] placeholder-[#0D3D1F]/50 focus:outline-none focus:ring-2 focus:ring-[#0D3D1F]/30"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="flex-1 px-5 py-4 rounded-full bg-white/80 backdrop-blur-sm text-[#0D3D1F] placeholder-[#0D3D1F]/50 focus:outline-none focus:ring-2 focus:ring-[#0D3D1F]/30"
                  />
                </div>

                <input
                  type="email"
                  placeholder="Work email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-4 rounded-full bg-white/80 backdrop-blur-sm text-[#0D3D1F] placeholder-[#0D3D1F]/50 focus:outline-none focus:ring-2 focus:ring-[#0D3D1F]/30"
                />

                <input
                  type="text"
                  placeholder="Company"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-5 py-4 rounded-full bg-white/80 backdrop-blur-sm text-[#0D3D1F] placeholder-[#0D3D1F]/50 focus:outline-none focus:ring-2 focus:ring-[#0D3D1F]/30"
                />

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
