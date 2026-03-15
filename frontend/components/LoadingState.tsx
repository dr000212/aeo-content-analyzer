"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const messages = [
  "Crawling page...",
  "Analyzing structure...",
  "Checking schema markup...",
  "Running NLP analysis...",
  "Generating recommendations...",
];

export default function LoadingState() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-border border-t-primary animate-spin" />
      </div>
      <p
        className={`text-text-muted text-sm transition-opacity duration-300 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {messages[index]}
      </p>
      <div className="flex gap-1.5">
        {messages.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              i <= index ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
