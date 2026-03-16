"use client";

import { useState } from "react";
import { ArrowRight, Search, ChevronDown, ChevronUp } from "lucide-react";
import { PILLAR_WHAT_WE_CHECK, GEO_SUB_WHAT_WE_CHECK, GEO_SUB_LABELS } from "@/lib/labels";

const categories = [
  {
    key: "technical_seo",
    icon: "🏗️",
    name: "Site Foundation",
    desc: "Is your website built right?",
    color: "from-blue-500 to-blue-600",
    borderColor: "border-blue-400",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    key: "onpage_seo",
    icon: "📝",
    name: "Content",
    desc: "Is your content set up for search?",
    color: "from-purple-500 to-purple-600",
    borderColor: "border-purple-400",
    bgLight: "bg-purple-50",
    textColor: "text-purple-700",
  },
  {
    key: "links",
    icon: "🔗",
    name: "Links",
    desc: "Are your links helping or hurting?",
    color: "from-emerald-500 to-emerald-600",
    borderColor: "border-emerald-400",
    bgLight: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  {
    key: "performance",
    icon: "⚡",
    name: "Speed",
    desc: "How fast does your page load?",
    color: "from-amber-500 to-amber-600",
    borderColor: "border-amber-400",
    bgLight: "bg-amber-50",
    textColor: "text-amber-700",
  },
  {
    key: "geo_readiness",
    icon: "🤖",
    name: "AI Readiness",
    desc: "Can AI assistants cite your content?",
    color: "from-violet-500 to-fuchsia-500",
    borderColor: "border-violet-400",
    bgLight: "bg-violet-50",
    textColor: "text-violet-700",
  },
];

function CategoryCard({ cat }: { cat: typeof categories[number] }) {
  const [expanded, setExpanded] = useState(false);
  const info = PILLAR_WHAT_WE_CHECK[cat.key];

  return (
    <div
      className={`bg-card border-l-4 ${cat.borderColor} border border-border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4 flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <span className="text-lg">{cat.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-text-main text-sm">{cat.name}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.bgLight} ${cat.textColor}`}>
                {info.weight}%
              </span>
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-text-dim" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-dim" />
              )}
            </div>
          </div>
          <p className="text-xs text-text-muted mt-0.5">{cat.desc}</p>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className={`rounded-lg ${cat.bgLight} p-3`}>
            <p className="text-xs font-medium text-text-muted mb-2">{info.summary}</p>
            <ul className="space-y-1.5">
              {info.checks.map((check, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-text-muted">
                  <span className={`${cat.textColor} mt-0.5 flex-shrink-0`}>•</span>
                  <span>{check}</span>
                </li>
              ))}
            </ul>

            {cat.key === "geo_readiness" && (
              <div className="mt-3 pt-3 border-t border-violet-200 space-y-2">
                <p className="text-[11px] font-semibold text-violet-700 uppercase tracking-wider">Sub-areas</p>
                {(["structure", "schema_markup", "entity", "readability"] as const).map((sub) => {
                  const subInfo = GEO_SUB_WHAT_WE_CHECK[sub];
                  const subLabel = GEO_SUB_LABELS[sub];
                  return (
                    <div key={sub} className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-violet-700 w-28 flex-shrink-0">
                        {subLabel.name}
                      </span>
                      <div className="flex-1 bg-violet-200 rounded-full h-1.5">
                        <div
                          className="bg-violet-500 rounded-full h-1.5"
                          style={{ width: `${subInfo.weight}%` }}
                        />
                      </div>
                      <span className="text-violet-600 font-medium w-8 text-right">{subInfo.weight}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmptyState() {
  return (
    <div className="space-y-10 py-8">
      {/* Hero */}
      <div className="flex flex-col items-center text-center px-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-accent opacity-15 blur-lg animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-accent/5 border border-primary/20 flex items-center justify-center">
            <Search className="w-9 h-9 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
          <span className="gradient-text">Find out how search engines and AI</span>
          <br />
          <span className="text-text-main">see your page</span>
        </h2>
        <p className="text-text-muted max-w-2xl mt-1">
          Paste any webpage URL above and we'll check 66 things across 5 categories
          to help you get found online.
        </p>
        <p className="text-xs text-text-dim mt-2">
          Tap any category below to see exactly what we check
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => (
          <CategoryCard key={cat.key} cat={cat} />
        ))}
      </div>

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
          className="flex items-center gap-2 text-primary font-medium hover:text-purple-600 transition-colors cursor-pointer mt-2"
        >
          <ArrowRight className="w-4 h-4" />
          Enter a URL above to get started
        </button>
      </div>
    </div>
  );
}
