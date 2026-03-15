"use client";

import {
  Search,
  LayoutGrid,
  Code2,
  Users,
  BookOpen,
  Target,
  BarChart3,
  CheckCircle2,
  Zap,
  Brain,
  FileSearch,
  ArrowRight,
} from "lucide-react";

const tracks = [
  {
    icon: LayoutGrid,
    title: "Structure & Format",
    desc: "Heading hierarchy, direct answer placement, paragraph length, question-format headings, and list/table usage.",
  },
  {
    icon: Code2,
    title: "Schema Markup",
    desc: "JSON-LD structured data, FAQPage, HowTo, Speakable schema, OpenGraph tags, Twitter Cards, and canonical URLs.",
  },
  {
    icon: Users,
    title: "Entity Coverage",
    desc: "Named entity recognition (NER), keyword density, topic distribution, internal/external linking, and term definitions.",
  },
  {
    icon: BookOpen,
    title: "Readability & Authority",
    desc: "Flesch Reading Ease, sentence length, passive voice, hedging words, author signals, and publish dates.",
  },
];

const scoring = [
  {
    icon: Target,
    label: "0\u2013100 Score",
    desc: "Weighted across all 4 modules",
  },
  {
    icon: CheckCircle2,
    label: "31 Checks",
    desc: "Pass/fail audit for each rule",
  },
  {
    icon: Zap,
    label: "Recommendations",
    desc: "Prioritized by impact & effort",
  },
  {
    icon: Brain,
    label: "AI Rewrites",
    desc: "GPT-powered content suggestions",
  },
];

export default function EmptyState() {
  return (
    <div className="space-y-12 py-8">
      {/* Hero */}
      <div className="flex flex-col items-center text-center px-4">
        {/* Animated radar icon */}
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-10 blur-md animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 flex items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-primary">
              <circle cx="12" cy="12" r="3" fill="currentColor" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
              <path d="M12 6a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <path d="M2 12a10 10 0 0 0 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-main mb-1 tracking-tight">
          Scan any page with{" "}
          <span className="text-text-main">AEO</span>
          <span className="text-primary">Lens</span>
        </h2>
        <p className="text-text-muted max-w-2xl mt-2 mb-2">
          Instantly audit and optimize your content for AI answer engines
          like ChatGPT, Perplexity, Google AI Overviews, and Copilot.
        </p>
      </div>

      {/* What is AEO */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileSearch className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-text-main">
            What is AEO (Answer Engine Optimization)?
          </h3>
        </div>
        <p className="text-text-muted leading-relaxed mb-4">
          AEO is the practice of optimizing web content so that AI-powered
          answer engines can easily understand, extract, and cite it. Unlike
          traditional SEO which focuses on ranking in search result lists, AEO
          ensures your content is structured for direct answers &mdash; the
          kind AI assistants pull from when responding to user queries.
        </p>
        <p className="text-text-muted leading-relaxed">
          As more users get answers from AI chatbots instead of clicking
          through search results, AEO-optimized content gets cited more often,
          driving visibility and authority in the age of generative search.
        </p>
      </div>

      {/* What We Track */}
      <div>
        <h3 className="text-lg font-bold text-text-main mb-5 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          What We Track
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((t) => (
            <div
              key={t.title}
              className="bg-card border border-border rounded-xl p-5 flex gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <t.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-text-main mb-1">
                  {t.title}
                </h4>
                <p className="text-sm text-text-muted leading-relaxed">
                  {t.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How Scoring Works */}
      <div>
        <h3 className="text-lg font-bold text-text-main mb-5 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          How the Output is Measured
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {scoring.map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-text-main text-sm mb-1">
                {s.label}
              </h4>
              <p className="text-xs text-text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted leading-relaxed">
            <span className="font-semibold text-text-main">Score formula:</span>{" "}
            Your overall score is a weighted average of four modules &mdash;{" "}
            <span className="text-primary font-medium">Structure (30%)</span>,{" "}
            <span className="text-purple-600 font-medium">Schema (25%)</span>,{" "}
            <span className="text-accent font-medium">Entity (25%)</span>, and{" "}
            <span className="text-warning font-medium">Readability (20%)</span>.
            Each module runs individual pass/fail checks. Failed checks generate
            targeted recommendations sorted by impact. Optionally, AI analyzes
            your content and produces specific rewrite suggestions and code
            snippets you can paste directly.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center text-center pt-4">
        <p className="text-text-muted mb-2">Ready to optimize?</p>
        <button
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>("#url-input input");
            if (input) {
              input.scrollIntoView({ behavior: "smooth", block: "center" });
              setTimeout(() => input.focus(), 400);
            }
          }}
          className="flex items-center gap-2 text-primary font-medium hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          Enter a URL above to get started
        </button>
      </div>
    </div>
  );
}
