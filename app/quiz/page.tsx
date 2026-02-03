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

  useEffect(() => {
    if (role) {
      setQuestions([roleQuestion, ...getQuestionsForRole(role)]);
    }
  }, [role]);

  const totalQuestions = 6;
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
        router.push("/results");
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      }
    }, 300);
  };

  if (!currentQuestion) {
    return null;
  }

  // Determine subtitle based on question
  const getSubtitle = () => {
    if (currentQuestionIndex === 0) return "First, let's set the field.";
    return `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;
  };

  return (
    <div className="min-h-screen relative">
      {/* Full page background */}
      <div className="fixed inset-0 pointer-events-none">
        <Image
          src="/images/quiz-bg.png"
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
