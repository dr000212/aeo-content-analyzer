"use client";

import { useEffect, useState } from "react";

const messages = [
  "Opening your page...",
  "Checking if search engines can find it...",
  "Analyzing your content and headings...",
  "Testing how fast it loads...",
  "Checking if AI assistants can understand it...",
  "Generating your report...",
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
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Progress bar width
  const progress = ((index + 1) / messages.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-border border-t-primary animate-spin" />
      </div>
      <p
        className={`text-text-muted text-sm transition-opacity duration-300 text-center px-4 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {messages[index]}
      </p>
      {/* Progress bar */}
      <div className="w-48 h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
