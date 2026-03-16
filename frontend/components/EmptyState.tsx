"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Logo from "./Logo";
import { PILLAR_WHAT_WE_CHECK, GEO_SUB_WHAT_WE_CHECK, GEO_SUB_LABELS } from "@/lib/labels";

const categories = [
  {
    key: "technical_seo",
    icon: "🏗️",
    name: "Site Foundation",
    desc: "Is your website built right?",
    funDesc: "We verify the technical basics — security, mobile setup, and whether search engines can access your site properly. 🏠",
    color: "from-blue-500 to-cyan-400",
    borderColor: "border-blue-400",
    bgLight: "bg-blue-50",
    bgGradient: "from-blue-50 to-cyan-50",
    textColor: "text-blue-700",
    ringColor: "ring-blue-300",
    checkEmojis: ["🔒", "🚀", "✅", "🗺️", "🚪", "📍", "🔄", "📱", "🌍", "🔤"],
    checkSimple: [
      "Site uses HTTPS (secure)",
      "No unnecessary redirects",
      "Page loads without errors",
      "Search engine instructions found",
      "Page isn't blocked from search",
      "Sitemap available for crawlers",
      "Duplicate content protection set",
      "Mobile-friendly setup",
      "Language properly declared",
      "Character encoding configured",
    ],
  },
  {
    key: "onpage_seo",
    icon: "📝",
    name: "Content",
    desc: "Is your content set up for search?",
    funDesc: "We check your page title, descriptions, headings, and images — the elements that tell search engines what your page is about. 📚",
    color: "from-purple-500 to-pink-400",
    borderColor: "border-purple-400",
    bgLight: "bg-purple-50",
    bgGradient: "from-purple-50 to-pink-50",
    textColor: "text-purple-700",
    ringColor: "ring-purple-300",
    checkEmojis: ["🏷️", "📏", "🎯", "📋", "✂️", "🔗", "🖼️", "👑", "🎯", "📑"],
    checkSimple: [
      "Page has a title tag",
      "Title is the right length",
      "Title includes your main topic",
      "Meta description is present",
      "Description is the right length",
      "URL is clean and readable",
      "All images have alt text",
      "Exactly one H1 heading",
      "H1 mentions your key topic",
      "No empty headings on page",
    ],
  },
  {
    key: "links",
    icon: "🔗",
    name: "Links",
    desc: "Are your links helping or hurting?",
    funDesc: "We check if your links are working, descriptive, and connecting to both your own pages and credible external sources. 🌉",
    color: "from-emerald-500 to-teal-400",
    borderColor: "border-emerald-400",
    bgLight: "bg-emerald-50",
    bgGradient: "from-emerald-50 to-teal-50",
    textColor: "text-emerald-700",
    ringColor: "ring-emerald-300",
    checkEmojis: ["🏠", "🌐", "✅", "🛡️", "💬", "⚖️", "🚦"],
    checkSimple: [
      "Internal links to related pages",
      "External links for credibility",
      "No broken or empty links",
      "External links properly secured",
      "Descriptive anchor text used",
      "Healthy link-to-content ratio",
      "Internal links are accessible",
    ],
  },
  {
    key: "performance",
    icon: "⚡",
    name: "Speed",
    desc: "How fast does your page load?",
    funDesc: "Slow pages lose visitors and rank lower. We measure load time, code efficiency, and image optimization. ⏱️",
    color: "from-amber-500 to-orange-400",
    borderColor: "border-amber-400",
    bgLight: "bg-amber-50",
    bgGradient: "from-amber-50 to-orange-50",
    textColor: "text-amber-700",
    ringColor: "ring-amber-300",
    checkEmojis: ["⏱️", "📦", "🚫", "🎨", "📐", "🦥", "✨", "🗜️"],
    checkSimple: [
      "Loads in under 3 seconds",
      "Page size is reasonable",
      "No render-blocking scripts",
      "Stylesheets aren't too heavy",
      "Images have set dimensions",
      "Images use lazy loading",
      "Minimal inline CSS",
      "Server compression enabled",
    ],
  },
  {
    key: "geo_readiness",
    icon: "🤖",
    name: "AI Ready",
    desc: "Can AI assistants cite your content?",
    funDesc: "AI tools like ChatGPT, Google AI, and Perplexity now drive real traffic. We check if your content is structured for them to recommend. 🧠",
    color: "from-violet-500 to-fuchsia-400",
    borderColor: "border-violet-400",
    bgLight: "bg-violet-50",
    bgGradient: "from-violet-50 to-fuchsia-50",
    textColor: "text-violet-700",
    ringColor: "ring-violet-300",
    checkEmojis: ["📐", "🏷️", "🎯", "✍️"],
    checkSimple: [
      "Content Structure — headings, layout, organization",
      "Smart Tags — structured data for search engines",
      "Topic Depth — thorough coverage & authority",
      "Writing Quality — clarity, confidence, freshness",
    ],
  },
];

const geoSubEmojis: Record<string, string> = {
  structure: "📐",
  schema_markup: "🏷️",
  entity: "🎯",
  readability: "✍️",
};

function DescriptionSlideshow({ activeIndex }: { activeIndex: number }) {
  const cat = categories[activeIndex];
  const info = PILLAR_WHAT_WE_CHECK[cat.key];
  const isGeo = cat.key === "geo_readiness";

  return (
    <div
      key={activeIndex}
      className="relative bg-card border-2 border-border rounded-3xl overflow-hidden animate-fade-in min-h-[280px] shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      {/* Gradient header bar */}
      <div className={`bg-gradient-to-r ${cat.color} px-5 sm:px-6 py-4 flex items-center gap-3`}>
        <span className="text-2xl animate-bounce">{cat.icon}</span>
        <div className="flex-1">
          <h3 className="font-extrabold text-white text-lg">{cat.name}</h3>
          <p className="text-white/80 text-xs">{cat.desc}</p>
        </div>
        <span className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-white/25 text-white backdrop-blur-sm">
          {info.weight}% of score
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {/* Fun description */}
        <p className="text-sm text-text-muted leading-relaxed mb-5 italic">
          {cat.funDesc}
        </p>

        {/* Check items as mini-cards */}
        {!isGeo ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cat.checkSimple.map((check, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ${cat.bgLight} border border-transparent hover:border-current hover:shadow-md hover:scale-[1.03] transition-all duration-200 cursor-default group`}
              >
                <span className="text-base group-hover:scale-125 transition-transform duration-200 flex-shrink-0">
                  {cat.checkEmojis[i]}
                </span>
                <span className={`text-xs font-medium ${cat.textColor}`}>{check}</span>
              </div>
            ))}
          </div>
        ) : (
          /* GEO sub-areas as colorful cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["structure", "schema_markup", "entity", "readability"] as const).map((sub) => {
              const subInfo = GEO_SUB_WHAT_WE_CHECK[sub];
              const subLabel = GEO_SUB_LABELS[sub];
              return (
                <div
                  key={sub}
                  className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 rounded-2xl p-3.5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      {geoSubEmojis[sub]}
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-violet-700">{subLabel.name}</p>
                      <p className="text-[10px] text-violet-500 font-bold">{subInfo.weight}% weight · {subInfo.checks.length} checks</p>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {subInfo.checks.slice(0, 3).map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-violet-600">
                        <span className="text-violet-400 mt-0.5 flex-shrink-0">✦</span>
                        <span>{c}</span>
                      </li>
                    ))}
                    {subInfo.checks.length > 3 && (
                      <li className="text-[10px] text-violet-400 font-medium pl-4">
                        + {subInfo.checks.length - 3} more checks...
                      </li>
                    )}
                  </ul>
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
  const resumeRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle through categories
  useEffect(() => {
    if (!autoCycle) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % categories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoCycle]);

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
    setAutoCycle(false);
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => setAutoCycle(true), 15000);
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

      {/* Category Name Cards */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {categories.map((cat, i) => (
          <button
            key={cat.key}
            onClick={() => handleCardClick(i)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
              activeIndex === i
                ? `${cat.bgLight} ${cat.borderColor} ${cat.textColor} shadow-lg scale-105 ring-2 ${cat.ringColor}`
                : "bg-card border-border text-text-muted hover:border-slate-300 hover:shadow-sm hover:scale-[1.02]"
            }`}
          >
            <span className={`text-lg ${activeIndex === i ? "animate-bounce" : ""}`}>{cat.icon}</span>
            <span className="text-sm font-bold">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Progress dots — clickable */}
      <div className="flex justify-center gap-1.5">
        {categories.map((cat, i) => (
          <button
            key={cat.key}
            onClick={() => handleCardClick(i)}
            className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer hover:opacity-80 ${
              activeIndex === i
                ? `w-10 bg-gradient-to-r ${cat.color}`
                : "w-2.5 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>

      {/* Sliding Description Card */}
      <DescriptionSlideshow activeIndex={activeIndex} />

      {/* CTA */}
      <div className="flex flex-col items-center text-center pt-2">
        <p className="text-sm text-text-dim mb-2">Free · No signup required · Results in seconds</p>
        <button
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>("#url-input input");
            if (input) {
              input.scrollIntoView({ behavior: "smooth", block: "center" });
              setTimeout(() => input.focus(), 400);
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary via-purple-500 to-accent text-white font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Try it now — paste a URL above
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
