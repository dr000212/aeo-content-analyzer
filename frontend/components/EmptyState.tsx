"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, Sparkles, Send, Bot, MoreHorizontal } from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import URLInput from "./URLInput";
import { PILLAR_WHAT_WE_CHECK } from "@/lib/labels";

interface EmptyStateProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  error: string;
  onDismissError: () => void;
}

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const categories = [
  {
    key: "technical_seo",
    icon: "\u{1F3D7}\uFE0F",
    name: "Site Foundation",
    desc: "Is your website built right?",
    funDesc: "We verify the technical basics \u2014 security, mobile setup, and whether search engines can access your site properly. \u{1F3E0}",
    checkEmojis: ["\u{1F512}", "\u{1F680}", "\u2705", "\u{1F5FA}\uFE0F", "\u{1F6AA}", "\u{1F4CD}", "\u{1F504}", "\u{1F4F1}", "\u{1F30D}", "\u{1F524}", "\u{1F9ED}", "\u2699\uFE0F", "\u{1F6E1}\uFE0F"],
    checkSimple: [
      "Site uses HTTPS (secure)", "No unnecessary redirects", "Page loads without errors",
      "Search engine instructions found", "Page isn't blocked from search", "Sitemap available for crawlers",
      "Duplicate content protection set", "Mobile-friendly setup", "Language properly declared",
      "Character encoding configured", "Proper URL structure & routing", "Robots.txt properly configured",
      "Security headers present",
    ],
  },
  {
    key: "onpage_seo",
    icon: "\u{1F4DD}",
    name: "Content",
    desc: "Is your content set up for search?",
    funDesc: "We check your page title, descriptions, headings, and images \u2014 the elements that tell search engines what your page is about. \u{1F4DA}",
    checkEmojis: ["\u{1F3F7}\uFE0F", "\u{1F4CF}", "\u{1F3AF}", "\u{1F4CB}", "\u2702\uFE0F", "\u{1F517}", "\u{1F5BC}\uFE0F", "\u{1F451}", "\u{1F3AF}", "\u{1F4D1}", "\u{1F4C4}", "\u{1F511}", "\u{1F4F8}", "\u{1F5C2}\uFE0F"],
    checkSimple: [
      "Page has a title tag", "Title is the right length", "Title includes your main topic",
      "Meta description is present", "Description is the right length", "URL is clean and readable",
      "All images have alt text", "Exactly one H1 heading", "H1 mentions your key topic",
      "No empty headings on page", "Sufficient word count on page", "Keywords in first paragraph",
      "Open Graph tags for social sharing", "Proper heading hierarchy (H1\u2192H6)",
    ],
  },
  {
    key: "links",
    icon: "\u{1F517}",
    name: "Links",
    desc: "Are your links helping or hurting?",
    funDesc: "We check if your links are working, descriptive, and connecting to both your own pages and credible external sources. \u{1F309}",
    checkEmojis: ["\u{1F3E0}", "\u{1F310}", "\u2705", "\u{1F6E1}\uFE0F", "\u{1F4AC}", "\u2696\uFE0F", "\u{1F6A6}", "\u{1F517}", "\u21A9\uFE0F", "\u{1F9ED}", "\u{1F4CE}", "\u{1F500}", "\u{1F3F7}\uFE0F"],
    checkSimple: [
      "Internal links to related pages", "External links for credibility", "No broken or empty links",
      "External links properly secured", "Descriptive anchor text used", "Healthy link-to-content ratio",
      "Internal links are accessible", "No orphan pages detected", "Proper redirect chains",
      "Navigation links are crawlable", "Footer links are meaningful", "No excessive outbound links",
      "Anchor text variety & relevance",
    ],
  },
  {
    key: "performance",
    icon: "\u26A1",
    name: "Speed",
    desc: "How fast does your page load?",
    funDesc: "Slow pages lose visitors and rank lower. We measure load time, code efficiency, and image optimization. \u23F1\uFE0F",
    checkEmojis: ["\u23F1\uFE0F", "\u{1F4E6}", "\u{1F6AB}", "\u{1F3A8}", "\u{1F4D0}", "\u{1F9A5}", "\u2728", "\u{1F5DC}\uFE0F", "\u{1F5A5}\uFE0F", "\u{1F4E1}", "\u{1F39E}\uFE0F", "\u{1F50B}"],
    checkSimple: [
      "Loads in under 3 seconds", "Page size is reasonable", "No render-blocking scripts",
      "Stylesheets aren't too heavy", "Images have set dimensions", "Images use lazy loading",
      "Minimal inline CSS", "Server compression enabled", "Efficient DOM structure",
      "Fast server response time", "Optimized image formats (WebP)", "Minimal third-party scripts",
    ],
  },
  {
    key: "geo_readiness",
    icon: "\u{1F916}",
    name: "AI Ready",
    desc: "Can AI assistants cite your content?",
    funDesc: "AI tools like ChatGPT, Google AI, and Perplexity now drive real traffic. We check if your content is structured for them to recommend. \u{1F9E0}",
    checkEmojis: ["\u{1F4D0}", "\u{1F3F7}\uFE0F", "\u{1F3AF}", "\u270D\uFE0F", "\u2753", "\u{1F4CA}", "\u{1F9E9}", "\u{1F4AC}", "\u{1F50D}", "\u{1F4D6}", "\u{1F91D}", "\u{1F9E0}", "\u{1F4CC}", "\u{1F310}"],
    checkSimple: [
      "Clear heading hierarchy for AI parsing", "Schema markup for rich results",
      "Thorough topic coverage & authority", "Confident, jargon-free writing style",
      "FAQ sections AI can extract", "Structured data completeness",
      "Entity recognition & relevance", "Conversational tone for voice search",
      "Key terms in prominent positions", "Content freshness & recency signals",
      "Cited sources & trustworthiness", "Summary-ready content blocks",
      "Definition-style answers present", "Multi-language & locale signals",
    ],
  },
];

const DEMO_CONVERSATIONS = [
  {
    triggers: ["speed", "fast", "slow", "load", "performance"],
    question: "How is my site speed looking?",
    response: {
      alert: "Found a speed bottleneck...",
      text: "Your LCP (Largest Contentful Paint) is lagging at 3.4s on mobile. This is costing you ~14% in potential search visibility.",
      confidence: 94,
    },
  },
  {
    triggers: ["ai", "ai ready", "chatgpt", "perplexity", "geo"],
    question: "Is my site ready for AI search?",
    response: {
      alert: "AI readiness needs work...",
      text: "Your page is missing FAQ schema markup and doesn't have a direct answer in the opening paragraph. AI assistants are unlikely to cite your content right now.",
      confidence: 91,
    },
  },
  {
    triggers: ["fix", "improve", "better", "help", "what should"],
    question: "What should I fix first?",
    response: {
      alert: "Here's your priority fix...",
      text: 'Start with adding a meta description \u2014 it\'s a 5-minute fix that could improve your click-through rate by 30%.\n\n<meta name="description" content="Your 150-char summary here">',
      confidence: 97,
    },
  },
  {
    triggers: ["content", "seo", "title", "heading", "meta"],
    question: "How's my content optimization?",
    response: {
      alert: "Content analysis complete...",
      text: "Your title tag is 72 characters \u2014 slightly too long. Search engines will cut it off. Trim it to 60 characters max. Your H1 is good but doesn't contain your primary keyword.",
      confidence: 88,
    },
  },
];

/* ═══════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════ */

function useCountUp(target: number, duration: number, trigger: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) { setCount(0); return; }
    const start = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setCount(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, trigger]);
  return count;
}

function useTypewriter(text: string, speed: number, trigger: boolean) {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    if (!trigger) { setDisplay(""); return; }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplay(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, trigger]);
  return display;
}

/* ═══════════════════════════════════════════
   1. HERO DASHBOARD — ANIMATED 12s LOOP
   ═══════════════════════════════════════════ */

const PILLAR_BARS = [
  { name: "Site Foundation", icon: "\u{1F3D7}\uFE0F", target: 85, color: "#06D6A0" },
  { name: "Content", icon: "\u{1F4DD}", target: 72, color: "#3B82F6" },
  { name: "Links", icon: "\u{1F517}", target: 65, color: "#3B82F6" },
  { name: "Speed", icon: "\u26A1", target: 78, color: "#3B82F6" },
  { name: "AI Ready", icon: "\u{1F916}", target: 68, color: "#3B82F6" },
];

function AnimatedDashboard() {
  const [phase, setPhase] = useState(0); // 0-5
  const [tick, setTick] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.3 });

  // 12-second loop
  useEffect(() => {
    if (!isInView) return;
    const delays = [1000, 1000, 2000, 2000, 3000, 2000]; // total ~11s + 1s buffer
    let timeout: NodeJS.Timeout;
    let currentPhase = 0;

    function next() {
      currentPhase++;
      if (currentPhase > 5) {
        currentPhase = 0;
        setTick((t) => t + 1);
      }
      setPhase(currentPhase);
      timeout = setTimeout(next, delays[currentPhase]);
    }

    setPhase(0);
    timeout = setTimeout(next, delays[0]);
    return () => clearTimeout(timeout);
  }, [isInView, tick]);

  const typedUrl = useTypewriter("https://example.com/blog", 50, phase >= 0 && isInView);
  const mainScore = useCountUp(78, 1500, phase >= 2);
  const sub1 = useCountUp(85, 800, phase >= 3);
  const sub2 = useCountUp(72, 800, phase >= 3);
  const sub3 = useCountUp(91, 800, phase >= 3);
  const checksCount = useCountUp(66, 1000, phase >= 5);

  return (
    <div ref={ref} className="hidden lg:flex justify-center relative">
      <div className={`w-80 rounded-2xl bg-gradient-to-br from-[#1B2A3D] via-[#243748] to-[#0F1A26] shadow-2xl rotate-2 relative overflow-hidden p-4 transition-all duration-500 ${isInView ? "dashboard-glow" : ""}`}>
        {/* URL bar */}
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-green-400 live-dot" />
          <span className="text-[10px] text-white/60 font-mono flex-1 truncate">
            {typedUrl}
            {phase < 1 && <span className="typing-cursor" />}
          </span>
        </div>

        {/* Score card */}
        <div className="bg-white/10 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            {/* Score ring (SVG) */}
            <div className="w-12 h-12 relative">
              <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle
                  cx="20" cy="20" r="17" fill="none" stroke="#06D6A0" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(mainScore / 100) * 106.8} 106.8`}
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                {mainScore}
              </span>
            </div>
            <div>
              <div className="h-2 w-16 bg-white/20 rounded" />
              <div className="h-1.5 w-10 bg-white/10 rounded mt-1" />
            </div>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={phase >= 2 ? { opacity: 1, scale: 1 } : {}}
              className="ml-auto text-[9px] text-green-400 font-bold px-2 py-0.5 bg-green-400/10 rounded-full"
            >
              Good
            </motion.span>
          </div>
          {/* Sub-scores */}
          <div className="grid grid-cols-3 gap-1.5">
            {[sub1, sub2, sub3].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={phase >= 3 ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: i * 0.3 }}
                className="bg-white/5 rounded p-1.5 text-center"
              >
                <p className="text-white/80 text-[10px] font-bold">{s}</p>
                <div className="h-1 bg-white/10 rounded mt-1">
                  <div className="h-1 bg-[#3B82A8]/60 rounded transition-all duration-700" style={{ width: phase >= 3 ? `${[85, 72, 91][i]}%` : "0%" }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pillar progress bars */}
        <div className="space-y-1.5">
          {PILLAR_BARS.map((bar, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 rounded-md px-2.5 py-1.5">
              <span className="text-[10px]">{bar.icon}</span>
              <span className="text-[10px] text-white/70 flex-1">{bar.name}</span>
              <div className="w-12 h-1 bg-white/10 rounded overflow-hidden">
                <div
                  className="h-1 rounded transition-all ease-out"
                  style={{
                    width: phase >= 4 ? `${bar.target}%` : "0%",
                    backgroundColor: bar.target >= 85 ? "#06D6A0" : bar.target >= 50 ? "#3B82F6" : "#F59E0B",
                    transitionDuration: "0.8s",
                    transitionDelay: `${i * 0.3}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live insight badge */}
      <div className="absolute -bottom-4 -left-2 bg-white border border-border rounded-xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-green-400 live-dot" />
          <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">Live Insight</span>
        </div>
        <p className="text-2xl font-extrabold text-navy">{checksCount}</p>
        <p className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">Deep SEO Checks</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   2. INTERACTIVE CHAT MOCKUP
   ═══════════════════════════════════════════ */

interface ChatMsg {
  role: "user" | "bot";
  text: string;
  alert?: string;
  confidence?: number;
}

const ROUND_SUGGESTIONS = [
  ["How is my site speed?", "Is my site AI ready?", "What should I fix first?"],
  ["How's my content?", "What should I fix first?", "Is my site AI ready?"],
  ["Analyze my own page \u2191"],
];

function InteractiveChatMockup({ onScrollToInput }: { onScrollToInput: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "bot", text: "Analyzing your URL foundations. Connection established." },
  ]);
  const [round, setRound] = useState(0);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [confidenceWidth, setConfidenceWidth] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const handleQuestion = useCallback(
    (text: string) => {
      if (typing) return;

      // Final round -> scroll to input
      if (round >= 2 || text.includes("\u2191")) {
        onScrollToInput();
        return;
      }

      // Find matching conversation
      const lower = text.toLowerCase();
      const match = DEMO_CONVERSATIONS.find((c) =>
        c.triggers.some((t) => lower.includes(t))
      );

      const userMsg: ChatMsg = { role: "user", text };
      setMessages((prev) => [...prev, userMsg]);
      setTyping(true);
      setConfidenceWidth(null);

      setTimeout(() => {
        setTyping(false);
        if (match) {
          const botMsg: ChatMsg = {
            role: "bot",
            text: match.response.text,
            alert: match.response.alert,
            confidence: match.response.confidence,
          };
          setMessages((prev) => [...prev, botMsg]);
          setConfidenceWidth(match.response.confidence);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              text: "Great question! Analyze your page above to get personalized answers about your specific site.",
            },
          ]);
        }
        setRound((r) => r + 1);
      }, 1500);
    },
    [typing, round, onScrollToInput]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleQuestion(input.trim());
    setInput("");
  };

  const suggestions = ROUND_SUGGESTIONS[Math.min(round, ROUND_SUGGESTIONS.length - 1)];

  return (
    <div className="bg-white border-2 border-border rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-[#FAFBFC]">
        <span className="w-2.5 h-2.5 rounded-full bg-green-400 live-dot" />
        <div className="flex-1">
          <p className="text-sm font-bold text-navy">SearchEO Expert Beta</p>
        </div>
        <MoreHorizontal className="w-4 h-4 text-text-dim" />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="p-3.5 space-y-3 min-h-[280px] max-h-[360px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.role === "bot" ? (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-[#F0F3F6] border border-border rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-navy max-w-[85%] space-y-2">
                    {msg.alert && (
                      <p className="text-xs font-semibold text-warning flex items-center gap-1">
                        <span>&#9888;</span> {msg.alert}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.confidence && (
                      <div>
                        <div className="flex justify-between text-[10px] font-semibold text-text-dim uppercase tracking-wider mb-1">
                          <span>AI Confidence</span>
                          <span>{msg.confidence}%</span>
                        </div>
                        <div className="confidence-bar">
                          <div
                            className="confidence-fill"
                            style={{ width: confidenceWidth && i === messages.length - 1 ? `${confidenceWidth}%` : msg.confidence ? `${msg.confidence}%` : "0%" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="bg-primary text-white rounded-full px-4 py-2 text-sm max-w-[85%]">
                    {msg.text}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {typing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2.5"
          >
            <div className="w-7 h-7 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-[#F0F3F6] border border-border rounded-xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Suggested questions */}
      {!typing && (
        <div className="px-3.5 pb-2 flex flex-wrap gap-1.5">
          {suggestions.map((q, i) => (
            <button
              key={`${round}-${i}`}
              onClick={() => handleQuestion(q)}
              className="text-xs px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary font-medium hover:bg-primary/10 hover:border-primary/40 transition-all cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-border px-4 py-3 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your site visibility..."
          className="flex-1 text-sm bg-transparent text-text-main placeholder:text-text-dim focus:outline-none"
          disabled={typing}
        />
        <button
          type="submit"
          disabled={typing || !input.trim()}
          className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════
   3. ANIMATED PILLAR SLIDESHOW SECTION
   ═══════════════════════════════════════════ */

function DescriptionSlideshow({ activeIndex }: { activeIndex: number }) {
  const cat = categories[activeIndex];
  const info = PILLAR_WHAT_WE_CHECK[cat.key];
  const checkOffset = categories.slice(0, activeIndex).reduce((sum, c) => sum + c.checkSimple.length, 0);

  return (
    <motion.div
      key={activeIndex}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="relative bg-card border-2 border-primary/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="grid sm:grid-cols-[260px_1fr]">
        {/* Left panel */}
        <div className="bg-gradient-to-b from-navy to-[#243748] p-5 sm:p-6 flex flex-col justify-between text-white relative overflow-hidden">
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

        {/* Right: checks grid with cascade */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider">
              Checks #{checkOffset + 1}\u2013{checkOffset + cat.checkSimple.length} of 66
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-600">All scanned</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[5px]">
            {cat.checkSimple.map((check, i) => (
              <motion.div
                key={`${activeIndex}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl border transition-all duration-200 cursor-default group hover:shadow-md hover:translate-x-1 hover:bg-primary/[0.04] ${
                  i % 2 === 0
                    ? "bg-gradient-to-r from-slate-50 to-white border-slate-100 hover:border-primary/25"
                    : "bg-gradient-to-r from-white to-slate-50 border-slate-100 hover:border-primary/25"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/12 to-primary/5 group-hover:from-primary/25 group-hover:to-primary/10 flex items-center justify-center flex-shrink-0 transition-all duration-200">
                  <span className="text-sm group-hover:scale-110 transition-transform duration-200">{cat.checkEmojis[i]}</span>
                </div>
                <span className="text-[11px] font-medium text-text-main group-hover:text-primary transition-colors leading-snug flex-1">{check}</span>
                <span className="text-emerald-400 opacity-40 group-hover:opacity-100 group-hover:text-emerald-500 group-hover:scale-115 transition-all flex-shrink-0 text-[10px]">\u2713</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   4. SCROLL PROGRESS BAR
   ═══════════════════════════════════════════ */

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function EmptyState({ onAnalyze, isLoading, error, onDismissError }: EmptyStateProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoCycle, setAutoCycle] = useState(true);
  const resumeRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll-triggered section refs
  const analyzeSectionRef = useRef(null);
  const analyzeInView = useInView(analyzeSectionRef, { once: true, amount: 0.2 });

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

  const scrollToInput = () => {
    const input = document.querySelector<HTMLInputElement>("#url-input input");
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => input.focus(), 400);
    }
  };

  return (
    <div className="space-y-16 py-4">
      <ScrollProgress />

      {/* ═══════ 1. HERO ═══════ */}
      <section className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-navy"
          >
            Find out how
            <br />
            <span className="gradient-text">search engines and AI</span>
            <br />
            <span className="text-navy">see your page</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 pl-4 border-l-2 border-primary/40"
          >
            <p className="text-text-muted text-sm md:text-base italic leading-relaxed max-w-md">
              &ldquo;Your AI SEO assistant that doesn&apos;t just find problems &mdash; it tells you exactly how to fix them, in plain English.&rdquo;
            </p>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-text-muted text-sm max-w-md"
          >
            Paste any URL and get a full SEO audit in seconds. Our <span className="font-semibold text-primary">AI Expert</span> then walks you through every fix &mdash; no jargon, just clear next steps.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6"
          >
            <URLInput onAnalyze={onAnalyze} isLoading={isLoading} />
            {error && (
              <div className="mt-3 p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-center justify-between">
                <p className="text-sm text-danger">{error}</p>
                <button onClick={onDismissError} className="text-danger text-sm ml-4">Dismiss</button>
              </div>
            )}
            <p className="mt-2 text-xs text-text-dim">
              Free &middot; <span className="font-semibold">No Login Required</span> &middot; Results in seconds
            </p>
          </motion.div>
        </div>

        {/* Animated dashboard */}
        <AnimatedDashboard />
      </section>

      {/* ═══════ 2. YOUR AI SEO EXPERT ═══════ */}
      <section className="border-t border-border pt-10">
        <div className="grid lg:grid-cols-[1fr_420px] gap-4 items-start">
          <div className="lg:pt-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-navy leading-tight">
              Your AI SEO Expert.
            </h2>
            <p className="mt-3 text-text-muted text-base leading-relaxed max-w-md">
              Skip the guesswork. Ask plain-English questions about your report and get back specific code snippets, priority rankings, and actionable next steps &mdash; not just raw data.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {[
                { emoji: "\u{1F3AF}", title: "Personalized Fixes", sub: "Tailored to your page" },
                { emoji: "\u{1F4A1}", title: "Code Examples", sub: "Copy-paste ready" },
                { emoji: "\u26A1", title: "Instant Answers", sub: "No waiting around" },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -6, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}
                  className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-2.5 transition-all cursor-default"
                >
                  <span className="text-lg">{card.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-navy">{card.title}</p>
                    <p className="text-[10px] text-text-dim">{card.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Interactive chat mockup */}
          <InteractiveChatMockup onScrollToInput={scrollToInput} />
        </div>
      </section>

      {/* ═══════ 3. EVERYTHING WE ANALYZE ═══════ */}
      <section ref={analyzeSectionRef} className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={analyzeInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h3 className="text-2xl md:text-3xl font-extrabold text-navy">Everything We Analyze</h3>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={analyzeInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm text-text-muted mt-2 max-w-lg mx-auto"
          >
            From technical setup to AI readiness &mdash; tap any category to see the exact checks we run and how they shape your score.
          </motion.p>
        </motion.div>

        {/* Pillar tab buttons with cascade */}
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
          initial="hidden"
          animate={analyzeInView ? "visible" : "hidden"}
          className="flex flex-wrap justify-center gap-2 sm:gap-2.5"
        >
          {categories.map((cat, i) => {
            const info = PILLAR_WHAT_WE_CHECK[cat.key];
            return (
              <motion.button
                key={cat.key}
                variants={{
                  hidden: { opacity: 0, y: 15, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.4 }}
                onClick={() => handleCardClick(i)}
                whileHover={{ y: -4, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  activeIndex === i
                    ? "bg-primary/10 border-primary text-primary shadow-lg scale-105 ring-2 ring-primary/30"
                    : "bg-card border-border text-text-muted hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                <span className={`text-lg ${activeIndex === i ? "animate-bounce" : ""}`}>{cat.icon}</span>
                <span className="text-sm font-bold">{cat.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeIndex === i ? "bg-primary/20 text-primary" : "bg-slate-100 text-text-dim"
                }`}>{info.weight}%</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Progress dots */}
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

        {/* Detail card with animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={analyzeInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <AnimatePresence mode="wait">
            <DescriptionSlideshow activeIndex={activeIndex} />
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ═══════ 4. CTA ═══════ */}
      <section className="flex flex-col items-center text-center pb-4">
        <p className="text-sm text-text-dim mb-3">Free &middot; No Login Required &middot; Results in seconds</p>
        <motion.button
          onClick={scrollToInput}
          whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(59,130,168,0.25)" }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-lg shadow-primary/25 btn-shimmer cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Try it now &mdash; paste a URL above
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </section>
    </div>
  );
}
