"use client";

import { useEffect, useState } from "react";

const steps = [
  { icon: "🌐", label: "Opening your page...", color: "from-blue-500 to-cyan-400" },
  { icon: "🔍", label: "Checking if search engines can find it...", color: "from-cyan-400 to-teal-400" },
  { icon: "📝", label: "Analyzing your content and headings...", color: "from-teal-400 to-emerald-400" },
  { icon: "⚡", label: "Testing how fast it loads...", color: "from-emerald-400 to-yellow-400" },
  { icon: "🤖", label: "Checking if AI assistants can understand it...", color: "from-yellow-400 to-orange-400" },
  { icon: "📊", label: "Generating your report...", color: "from-orange-400 to-rose-400" },
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [fade, setFade] = useState(true);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
        setFade(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Animated dots
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      {/* Animated orb */}
      <div className="relative w-28 h-28">
        {/* Outer ring pulse */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-ping" style={{ animationDuration: "2s" }} />
        {/* Rotating gradient ring */}
        <div className="absolute inset-1 rounded-full animate-spin" style={{ animationDuration: "3s" }}>
          <div className={`w-full h-full rounded-full bg-gradient-to-r ${step.color} opacity-40 blur-sm`} />
        </div>
        {/* Inner circle with icon */}
        <div className="absolute inset-3 rounded-full bg-white shadow-xl flex items-center justify-center">
          <span
            className={`text-4xl transition-all duration-500 ${
              fade ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
          >
            {step.icon}
          </span>
        </div>
      </div>

      {/* Step indicator */}
      <div className="text-center space-y-2">
        <p
          className={`text-base font-semibold text-text-main transition-all duration-300 ${
            fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          {step.label}
        </p>
        <p className="text-xs text-text-dim">
          Step {currentStep + 1} of {steps.length}{dots}
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                i < currentStep
                  ? "bg-emerald-100 text-emerald-600 scale-90"
                  : i === currentStep
                  ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                  : "bg-slate-100 text-slate-400 scale-90"
              }`}
            >
              {i < currentStep ? "✓" : s.icon}
            </div>
            {i < steps.length - 1 && (
              <div className="w-6 h-0.5 rounded-full overflow-hidden bg-slate-200">
                <div
                  className="h-full bg-emerald-400 transition-all duration-700"
                  style={{ width: i < currentStep ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="w-64">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${step.color} transition-all duration-700 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-text-dim text-center mt-2">
          {Math.round(progress)}% complete
        </p>
      </div>
    </div>
  );
}
