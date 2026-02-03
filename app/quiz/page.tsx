"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { ProgressBar } from "@/components/Quiz/ProgressBar";
import { QuestionCard } from "@/components/Quiz/QuestionCard";
import { LaurelWreath } from "@/components/LaurelWreath";
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

  // Update questions when role is selected
  useEffect(() => {
    if (role) {
      setQuestions([roleQuestion, ...getQuestionsForRole(role)]);
    }
  }, [role]);

  const totalQuestions = 5;
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (questionId: string, answerId: string) => {
    const newAnswers = { ...answers, [questionId]: answerId };
    setAnswers(newAnswers);

    // If this is the role question, set the role
    if (questionId === "q1") {
      setRole(answerId as Role);
    }

    // Check if quiz is complete
    if (currentQuestionIndex === totalQuestions - 1) {
      // Calculate archetype and navigate to results
      const archetype = calculateArchetype(newAnswers, role || (answerId as Role));

      // Store data in sessionStorage for the results page
      sessionStorage.setItem("quizAnswers", JSON.stringify(newAnswers));
      sessionStorage.setItem("quizRole", role || answerId);
      sessionStorage.setItem("quizArchetype", archetype);

      router.push("/results");
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      {/* Background decoration */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-10">
        <LaurelWreath className="w-[1000px] h-[500px]" />
      </div>

      <main className="relative pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-12">
            <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
          </div>

          {/* Question */}
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            currentAnswer={answers[currentQuestion.id]}
          />

          {/* Estimated time */}
          <p className="text-center text-text-muted text-sm mt-8">
            {totalQuestions - currentQuestionIndex - 1} questions remaining
          </p>
        </div>
      </main>
    </div>
  );
}
