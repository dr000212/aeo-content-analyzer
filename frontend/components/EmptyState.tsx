"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Logo from "./Logo";
import { PILLAR_WHAT_WE_CHECK, GEO_SUB_WHAT_WE_CHECK, GEO_SUB_LABELS } from "@/lib/labels";

const categories = [
  {
    key: "technical_seo",
    icon: "🏗️",
    name: "Site Foundation",
    desc: "Is your website built right?",
    detail: "We check if your site is secure, mobile-friendly, and properly set up for search engines to find and crawl.",
    color: "from-blue-500 to-blue-600",
    borderColor: "border-blue-400",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    ringColor: "ring-blue-400",
  },
  {
    key: "onpage_seo",
    icon: "📝",
    name: "Content",
    desc: "Is your content set up for search?",
    detail: "We check your page title, descriptions, headings, and images — the things that tell search engines what your page is about.",
    color: "from-purple-500 to-purple-600",
    borderColor: "border-purple-400",
    bgLight: "bg-purple-50",
    textColor: "text-purple-700",
    ringColor: "ring-purple-400",
  },
  {
    key: "links",
    icon: "🔗",
    name: "Links",
    desc: "Are your links helping or hurting?",
    detail: "We check if your links are working, descriptive, and connecting to both your own pages and credible external sources.",
    color: "from-emerald-500 to-emerald-600",
    borderColor: "border-emerald-400",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
    ringColor: "ring-emerald-400",
  },
  {
    key: "performance",
    icon: "⚡",
    name: "Speed",
    desc: "How fast does your page load?",
    detail: "We check your load time, code size, image optimization, and whether scripts are blocking your page from appearing quickly.",
    color: "from-amber-500 to-amber-600",
    borderColor: "border-amber-400",
    bgLight: "bg-amber-50",
    textColor: "text-amber-700",
    ringColor: "ring-amber-400",
  },
  {
    key: "geo_readiness",
    icon: "🤖",
    name: "AI Ready",
    desc: "Can AI assistants cite your content?",
    detail: "We check 31 things across content structure, smart tags, topic depth, and writing quality — so AI tools like ChatGPT can find and recommend you.",
    color: "from-violet-500 to-fuchsia-500",
    borderColor: "border-violet-400",
    bgLight: "bg-violet-50",
    textColor: "text-violet-700",
    ringColor: "ring-violet-400",
  },
];

function DescriptionSlideshow({ activeIndex }: { activeIndex: number }) {
  const cat = categories[activeIndex];
  const info = PILLAR_WHAT_WE_CHECK[cat.key];

  return (
    <div
      key={activeIndex}
      className="bg-card border border-border rounded-2xl p-5 sm:p-6 animate-fade-in min-h-[220px]"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm`}>
          <span className="text-lg">{cat.icon}</span>
        </div>
        <div>
          <h3 className="font-bold text-text-main">{cat.name}</h3>
          <p className="text-xs text-text-muted">{cat.desc}</p>
        </div>
        <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${cat.bgLight} ${cat.textColor}`}>
          {info.weight}% of score
        </span>
      </div>

      <p className="text-sm text-text-muted leading-relaxed mb-4">
        {cat.detail}
      </p>

      {/* Check list */}
      <div className={`rounded-xl ${cat.bgLight} p-4`}>
        <p className="text-[11px] font-semibold text-text-dim uppercase tracking-wider mb-2">
          What we check ({info.checks.length} items)
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {info.checks.map((check, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-text-muted">
              <span className={`${cat.textColor} mt-0.5 flex-shrink-0`}>✦</span>
              <span>{check}</span>
            </li>
          ))}
        </ul>

        {cat.key === "geo_readiness" && (
          <div className="mt-3 pt-3 border-t border-violet-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["structure", "schema_markup", "entity", "readability"] as const).map((sub) => {
              const subInfo = GEO_SUB_WHAT_WE_CHECK[sub];
              const subLabel = GEO_SUB_LABELS[sub];
              return (
                <div key={sub} className="bg-white/60 rounded-lg px-2.5 py-2 text-center">
                  <p className="text-[10px] font-bold text-violet-600">{subInfo.weight}%</p>
                  <p className="text-[11px] font-medium text-violet-700">{subLabel.name}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmptyState() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoCycle, setAutoCycle] = useState(true);

  // Auto-cycle through categories
  useEffect(() => {
    if (!autoCycle) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % categories.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [autoCycle]);

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
    setAutoCycle(false);
    // Resume auto-cycle after 12 seconds of inactivity
    setTimeout(() => setAutoCycle(true), 12000);
  };

  return (
    <div className="space-y-8 py-8">
      {/* Hero with Logo */}
      <div className="flex flex-col items-center text-center px-4">
        <div className="relative w-16 h-16 mb-5">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-accent opacity-20 blur-lg animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-accent flex items-center justify-center shadow-xl shadow-primary/20">
            <Logo size={32} />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
          <span className="gradient-text">Find out how search engines and AI</span>
          <br />
          <span className="text-text-main">see your page</span>
        </h2>
        <p className="text-text-muted max-w-2xl mt-1">
          We check <span className="font-semibold text-primary">66 things</span> across{" "}
          <span className="font-semibold text-primary">5 categories</span> to help you get found online.
        </p>
      </div>

      {/* Category Name Cards — compact row */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {categories.map((cat, i) => (
          <button
            key={cat.key}
            onClick={() => handleCardClick(i)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
              activeIndex === i
                ? `${cat.bgLight} ${cat.borderColor} ${cat.textColor} shadow-md scale-105`
                : "bg-card border-border text-text-muted hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            <span className="text-lg">{cat.icon}</span>
            <span className="text-sm font-semibold">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {categories.map((cat, i) => (
          <div
            key={cat.key}
            className={`h-1 rounded-full transition-all duration-500 ${
              activeIndex === i
                ? `w-8 bg-gradient-to-r ${cat.color}`
                : "w-2 bg-slate-300"
            }`}
          />
        ))}
      </div>

      {/* Sliding Description Card */}
      <DescriptionSlideshow activeIndex={activeIndex} />

      {/* CTA */}
      <div className="flex flex-col items-center text-center pt-2">
        <p className="text-sm text-text-dim mb-1">Free · No signup required · Results in seconds</p>
        <button
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>("#url-input input");
            if (input) {
              input.scrollIntoView({ behavior: "smooth", block: "center" });
              setTimeout(() => input.focus(), 400);
            }
          }}
          className="flex items-center gap-2 text-primary font-semibold hover:text-purple-600 transition-colors cursor-pointer mt-2"
        >
          <ArrowRight className="w-4 h-4" />
          Enter a URL above to get started
        </button>
      </div>
    </div>
  );
}
