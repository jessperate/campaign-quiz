"use client";

import { useState, useEffect } from "react";
import { AnswerOption } from "./AnswerOption";
import { Button } from "../ui/Button";
import type { Question } from "@/lib/quiz-data";

interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string, answerId: string) => void;
  currentAnswer?: string;
}

export function QuestionCard({ question, onAnswer, currentAnswer }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(currentAnswer);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setSelectedAnswer(currentAnswer);
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [question.id, currentAnswer]);

  const handleSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleNext = () => {
    if (selectedAnswer) {
      onAnswer(question.id, selectedAnswer);
    }
  };

  return (
    <div
      className={`w-full max-w-2xl mx-auto transition-all duration-300 ${
        isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
        {question.text}
      </h2>

      <div className="space-y-4 mb-8">
        {question.options.map((option) => (
          <AnswerOption
            key={option.id}
            id={option.id}
            text={option.text}
            selected={selectedAnswer === option.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleNext}
          disabled={!selectedAnswer}
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
