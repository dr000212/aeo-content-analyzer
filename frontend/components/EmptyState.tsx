"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Send, Settings, Bot, MoreHorizontal } from "lucide-react";
import URLInput from "./URLInput";
import { PILLAR_WHAT_WE_CHECK, GEO_SUB_WHAT_WE_CHECK, GEO_SUB_LABELS } from "@/lib/labels";

interface EmptyStateProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  error: string;
  onDismissError: () => void;
}

const categories = [
  {
    key: "technical_seo",
    icon: "🏗️",
    name: "Site Foundation",
    desc: "Is your website built right?",
    funDesc: "We verify the technical basics — security, mobile setup, and whether search engines can access your site properly. 🏠",
    checkEmojis: ["🔒", "🚀", "✅", "🗺️", "🚪", "📍", "🔄", "📱", "🌍", "🔤", "🧭", "⚙️", "🛡️"],
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
      "Proper URL structure & routing",
      "Robots.txt properly configured",
      "Security headers present",
    ],
  },
  {
    key: "onpage_seo",
    icon: "📝",
    name: "Content",
    desc: "Is your content set up for search?",
    funDesc: "We check your page title, descriptions, headings, and images — the elements that tell search engines what your page is about. 📚",
    checkEmojis: ["🏷️", "📏", "🎯", "📋", "✂️", "🔗", "🖼️", "👑", "🎯", "📑", "📄", "🔑", "📸", "🗂️"],
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
      "Sufficient word count on page",
      "Keywords in first paragraph",
      "Open Graph tags for social sharing",
      "Proper heading hierarchy (H1→H6)",
    ],
  },
  {
    key: "links",
    icon: "🔗",
    name: "Links",
    desc: "Are your links helping or hurting?",
    funDesc: "We check if your links are working, descriptive, and connecting to both your own pages and credible external sources. 🌉",
    checkEmojis: ["🏠", "🌐", "✅", "🛡️", "💬", "⚖️", "🚦", "🔗", "↩️", "🧭", "📎", "🔀", "🏷️"],
    checkSimple: [
      "Internal links to related pages",
      "External links for credibility",
      "No broken or empty links",
      "External links properly secured",
      "Descriptive anchor text used",
      "Healthy link-to-content ratio",
      "Internal links are accessible",
      "No orphan pages detected",
      "Proper redirect chains",
      "Navigation links are crawlable",
      "Footer links are meaningful",
      "No excessive outbound links",
      "Anchor text variety & relevance",
    ],
  },
  {
    key: "performance",
    icon: "⚡",
    name: "Speed",
    desc: "How fast does your page load?",
    funDesc: "Slow pages lose visitors and rank lower. We measure load time, code efficiency, and image optimization. ⏱️",
    checkEmojis: ["⏱️", "📦", "🚫", "🎨", "📐", "🦥", "✨", "🗜️", "🖥️", "📡", "🎞️", "🔋"],
    checkSimple: [
      "Loads in under 3 seconds",
      "Page size is reasonable",
      "No render-blocking scripts",
      "Stylesheets aren't too heavy",
      "Images have set dimensions",
      "Images use lazy loading",
      "Minimal inline CSS",
      "Server compression enabled",
      "Efficient DOM structure",
      "Fast server response time",
      "Optimized image formats (WebP)",
      "Minimal third-party scripts",
    ],
  },
  {
    key: "geo_readiness",
    icon: "🤖",
    name: "AI Ready",
    desc: "Can AI assistants cite your content?",
    funDesc: "AI tools like ChatGPT, Google AI, and Perplexity now drive real traffic. We check if your content is structured for them to recommend. 🧠",
    checkEmojis: ["📐", "🏷️", "🎯", "✍️", "❓", "📊", "🧩", "💬", "🔍", "📖", "🤝", "🧠", "📌", "🌐"],
    checkSimple: [
      "Clear heading hierarchy for AI parsing",
      "Schema markup for rich results",
      "Thorough topic coverage & authority",
      "Confident, jargon-free writing style",
      "FAQ sections AI can extract",
      "Structured data completeness",
      "Entity recognition & relevance",
      "Conversational tone for voice search",
      "Key terms in prominent positions",
      "Content freshness & recency signals",
      "Cited sources & trustworthiness",
      "Summary-ready content blocks",
      "Definition-style answers present",
      "Multi-language & locale signals",
    ],
  },
];

function DescriptionSlideshow({ activeIndex }: { activeIndex: number }) {
  const cat = categories[activeIndex];
  const info = PILLAR_WHAT_WE_CHECK[cat.key];
  // Calculate check offset for global numbering
  const checkOffset = categories.slice(0, activeIndex).reduce((sum, c) => sum + c.checkSimple.length, 0);

  return (
    <div
      key={activeIndex}
      className="relative bg-card border-2 border-primary/20 rounded-2xl overflow-hidden animate-fade-in shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="grid sm:grid-cols-[260px_1fr]">
        {/* Left: category info panel */}
        <div className="bg-gradient-to-b from-navy to-[#243748] p-5 sm:p-6 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#3B82A8]/15 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#3B82A8]/30 text-[#7CBCE0] uppercase tracking-wider">{cat.checkSimple.length} checks</span>
            </div>
            <h3 className="font-extrabold text-xl leading-tight">{cat.name}</h3>
            <p className="text-white/60 text-xs mt-1.5 leading-relaxed">{cat.desc}</p>
          </div>
          <div className="mt-5 relative">
            <p className="text-[13px] text-white/50 leading-relaxed">{cat.funDesc}</p>
            <div className="mt-4 bg-white/5 rounded-xl p-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2">
                <span className="text-white/40">Score Impact</span>
                <span className="text-[#7CBCE0] font-extrabold">{info.weight}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#3B82A8] to-[#7CBCE0] transition-all duration-1000 ease-out" style={{ width: `${info.weight * 2.5}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: checks grid */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider">
              Checks #{checkOffset + 1}–{checkOffset + cat.checkSimple.length} of 66
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-600">All scanned</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[5px]">
            {cat.checkSimple.map((check, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl border transition-all duration-200 cursor-default group hover:shadow-md hover:scale-[1.02] hover:-translate-y-[1px] ${
                  i % 2 === 0
                    ? "bg-gradient-to-r from-slate-50 to-white border-slate-100 hover:border-primary/25"
                    : "bg-gradient-to-r from-white to-slate-50 border-slate-100 hover:border-primary/25"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/12 to-primary/5 group-hover:from-primary/25 group-hover:to-primary/10 flex items-center justify-center flex-shrink-0 transition-all duration-200">
                  <span className="text-sm group-hover:scale-110 transition-transform duration-200">{cat.checkEmojis[i]}</span>
                </div>
                <span className="text-[11px] font-medium text-text-main group-hover:text-primary transition-colors leading-snug flex-1">{check}</span>
                <span className="text-emerald-400 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0 text-[10px]">✓</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Typing chat message — reveals text like a GIF */
function TypingMessage({ text, delay = 0 }: { text: string; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(show);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [visible, text]);

  if (!visible) return null;

  return (
    <span>
      {displayText}
      {!done && <span className="typing-cursor" />}
    </span>
  );
}

export default function EmptyState({ onAnalyze, isLoading, error, onDismissError }: EmptyStateProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoCycle, setAutoCycle] = useState(true);
  const resumeRef = useRef<NodeJS.Timeout | null>(null);

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
    <div className="space-y-16 py-4">

      {/* ═══════ 1. HERO — two column ═══════ */}
      <section className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-navy">
            Find out how
            <br />
            <span className="gradient-text">search engines and AI</span>
            <br />
            <span className="text-navy">see your page</span>
          </h1>
          <div className="mt-5 pl-4 border-l-2 border-primary/40">
            <p className="text-text-muted text-sm md:text-base italic leading-relaxed max-w-md">
              &ldquo;Your AI SEO assistant that doesn&apos;t just find problems — it tells you exactly how to fix them, in plain English.&rdquo;
            </p>
          </div>
          <p className="mt-4 text-text-muted text-sm max-w-md">
            Paste any URL and get a full SEO audit in seconds. Our <span className="font-semibold text-primary">AI Expert</span> then walks you through every fix — no jargon, just clear next steps.
          </p>

          {/* URL Input inside hero */}
          <div className="mt-6">
            <URLInput onAnalyze={onAnalyze} isLoading={isLoading} />
            {error && (
              <div className="mt-3 p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-center justify-between">
                <p className="text-sm text-danger">{error}</p>
                <button onClick={onDismissError} className="text-danger text-sm ml-4">Dismiss</button>
              </div>
            )}
            <p className="mt-2 text-xs text-text-dim">
              Free · <span className="font-semibold">No Login Required</span> · Results in seconds
            </p>
          </div>
        </div>

        {/* Right: dashboard mockup visual */}
        <div className="hidden lg:flex justify-center relative">
          <div className="w-80 rounded-2xl bg-gradient-to-br from-[#1B2A3D] via-[#243748] to-[#0F1A26] shadow-2xl rotate-2 relative overflow-hidden p-4">
            {/* Fake dashboard UI */}
            <div className="bg-white/10 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full border-2 border-[#3B82A8] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">78</span>
                </div>
                <div>
                  <div className="h-2 w-16 bg-white/20 rounded" />
                  <div className="h-1.5 w-10 bg-white/10 rounded mt-1" />
                </div>
                <span className="ml-auto text-[9px] text-green-400 font-bold px-2 py-0.5 bg-green-400/10 rounded-full">Good</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {["85", "72", "91"].map((s, i) => (
                  <div key={i} className="bg-white/5 rounded p-1.5 text-center">
                    <p className="text-white/80 text-[10px] font-bold">{s}</p>
                    <div className="h-1 bg-white/10 rounded mt-1">
                      <div className="h-1 bg-[#3B82A8]/60 rounded" style={{ width: `${s}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              {["Site Foundation", "Content", "Links", "Speed", "AI Ready"].map((name, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 rounded-md px-2.5 py-1.5">
                  <span className="text-[10px]">{["🏗️", "📝", "🔗", "⚡", "🤖"][i]}</span>
                  <span className="text-[10px] text-white/70 flex-1">{name}</span>
                  <div className="w-12 h-1 bg-white/10 rounded">
                    <div className="h-1 bg-[#3B82A8] rounded" style={{ width: `${[80, 65, 90, 72, 55][i]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-4 -left-2 bg-white border border-border rounded-xl px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">Live Insight</span>
            </div>
            <p className="text-2xl font-extrabold text-navy">66</p>
            <p className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">Deep SEO Checks</p>
          </div>
        </div>
      </section>

      {/* ═══════ 2. YOUR AI SEO EXPERT — two column ═══════ */}
      <section className="border-t border-border pt-10">
        <div className="grid lg:grid-cols-[1fr_420px] gap-4 items-start">
          {/* Left: headline + description + stats */}
          <div className="lg:pt-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy leading-tight">
              Your AI SEO Expert.
            </h2>
            <p className="mt-3 text-text-muted text-base leading-relaxed max-w-md">
              Skip the guesswork. Ask plain-English questions about your report and get back specific code snippets, priority rankings, and actionable next steps — not just raw data.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-2.5">
                <span className="text-lg">🎯</span>
                <div>
                  <p className="text-sm font-bold text-navy">Personalized Fixes</p>
                  <p className="text-[10px] text-text-dim">Tailored to your page</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-2.5">
                <span className="text-lg">💡</span>
                <div>
                  <p className="text-sm font-bold text-navy">Code Examples</p>
                  <p className="text-[10px] text-text-dim">Copy-paste ready</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-2.5">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="text-sm font-bold text-navy">Instant Answers</p>
                  <p className="text-[10px] text-text-dim">No waiting around</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: chat mockup with typing animation */}
          <div className="bg-white border-2 border-border rounded-2xl shadow-xl overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-[#FAFBFC]">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <div className="flex-1">
                <p className="text-sm font-bold text-navy">SearchEO Expert Beta</p>
              </div>
              <MoreHorizontal className="w-4 h-4 text-text-dim" />
            </div>

            {/* Chat messages */}
            <div className="p-3.5 space-y-3 min-h-[280px]">
              {/* Bot: analyzing */}
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#F0F3F6] border border-border rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-navy max-w-[85%]">
                  Analyzing your URL foundations. Connection established.
                </div>
              </div>

              {/* User question */}
              <div className="flex justify-end">
                <div className="bg-primary text-white rounded-full px-4 py-2 text-sm">
                  How is my site speed looking?
                </div>
              </div>

              {/* Bot: speed bottleneck — with warning + confidence bar */}
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-[#F0F3F6] border border-border rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-navy max-w-[85%] space-y-2">
                  <p className="text-xs font-semibold text-warning flex items-center gap-1">
                    <span>&#9888;</span> Found a speed bottleneck...
                  </p>
                  <p>
                    <TypingMessage
                      text="Your LCP (Largest Contentful Paint) is lagging at 3.4s on mobile. This is costing you ~14% in potential search visibility."
                      delay={800}
                    />
                  </p>
                  <div>
                    <div className="flex justify-between text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-1">
                      <span>AI Confidence</span>
                      <span>94%</span>
                    </div>
                    <div className="h-1 rounded-full bg-border">
                      <div className="h-1 rounded-full bg-primary transition-all duration-1000" style={{ width: "94%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="border-t border-border px-4 py-3 flex items-center gap-3">
              <input
                type="text"
                placeholder="Ask about your site visibility..."
                className="flex-1 text-sm bg-transparent text-text-main placeholder:text-text-dim focus:outline-none"
                disabled
              />
              <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary" disabled>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 3. CATEGORY CARDS + SLIDESHOW ═══════ */}
      <section className="space-y-5">
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-navy">Everything We Analyze</h3>
          <p className="text-sm text-text-muted mt-2 max-w-lg mx-auto">
            From technical setup to AI readiness — tap any category to see the exact checks we run and how they shape your score.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
          {categories.map((cat, i) => {
            const info = PILLAR_WHAT_WE_CHECK[cat.key];
            return (
              <button
                key={cat.key}
                onClick={() => handleCardClick(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  activeIndex === i
                    ? "bg-primary/10 border-primary text-primary shadow-lg scale-105 ring-2 ring-primary/30"
                    : "bg-card border-border text-text-muted hover:border-primary/30 hover:shadow-sm hover:scale-[1.02]"
                }`}
              >
                <span className={`text-lg ${activeIndex === i ? "animate-bounce" : ""}`}>{cat.icon}</span>
                <span className="text-sm font-bold">{cat.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeIndex === i ? "bg-primary/20 text-primary" : "bg-slate-100 text-text-dim"
                }`}>{info.weight}%</span>
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="flex justify-center gap-1">
          {categories.map((cat, i) => (
            <button
              key={cat.key}
              onClick={() => handleCardClick(i)}
              className="relative h-1.5 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-all"
              style={{ width: activeIndex === i ? 48 : 12 }}
            >
              <div className="absolute inset-0 bg-border rounded-full" />
              {activeIndex === i && autoCycle && (
                <div className="absolute inset-0 bg-primary rounded-full animate-[progress_5s_linear]" />
              )}
              {activeIndex === i && !autoCycle && (
                <div className="absolute inset-0 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        <DescriptionSlideshow activeIndex={activeIndex} />
      </section>

      {/* ═══════ 4. CTA ═══════ */}
      <section className="flex flex-col items-center text-center pb-4">
        <p className="text-sm text-text-dim mb-3">Free · No Login Required · Results in seconds</p>
        <button
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>("#url-input input");
            if (input) {
              input.scrollIntoView({ behavior: "smooth", block: "center" });
              setTimeout(() => input.focus(), 400);
            }
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 hover:brightness-110 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Try it now — paste a URL above
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

    </div>
  );
}
