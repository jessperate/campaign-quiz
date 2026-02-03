"use client";

interface AnswerOptionProps {
  id: string;
  text: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function AnswerOption({ id, text, selected, onSelect }: AnswerOptionProps) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`answer-option w-full text-left p-5 rounded-xl border-2 ${
        selected
          ? "border-green bg-green/10"
          : "border-card-border bg-card-bg hover:border-green/50"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            selected ? "border-green bg-green" : "border-text-muted"
          }`}
        >
          {selected && (
            <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-white text-lg">{text}</span>
      </div>
    </button>
  );
}
