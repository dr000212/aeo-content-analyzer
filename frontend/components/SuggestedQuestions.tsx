"use client";

import { Sparkles } from "lucide-react";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export default function SuggestedQuestions({
  questions,
  onSelect,
  disabled = false,
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((q, i) => (
        <button
          key={`${i}-${q}`}
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-primary/20 text-primary text-xs font-medium hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Sparkles className="w-3 h-3" />
          {q}
        </button>
      ))}
    </div>
  );
}
