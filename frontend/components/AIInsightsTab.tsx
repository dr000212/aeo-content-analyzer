"use client";

import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";
import { AIRecommendation } from "@/lib/types";

interface AIInsightsTabProps {
  recommendations: AIRecommendation[];
  aiEnhanced: boolean;
}

function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    "Technical SEO": "Site Foundation",
    "On-Page SEO": "Content Optimization",
    Links: "Link Health",
    Performance: "Page Speed",
    Structure: "Content Structure",
    Schema: "Smart Tags",
    Entity: "Topic Depth",
    Readability: "Writing Quality",
  };
  return map[category] || category;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-primary hover:text-blue-600 font-medium transition-colors mt-2"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

export default function AIInsightsTab({
  recommendations,
  aiEnhanced,
}: AIInsightsTabProps) {
  if (!aiEnhanced || recommendations.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <Sparkles className="w-8 h-8 text-text-dim mx-auto mb-3" />
        <p className="text-sm text-text-muted">
          AI suggestions are not available for this analysis.
        </p>
        <p className="text-xs text-text-dim mt-1">
          This could be because AI enhancement was disabled or the AI service was unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium text-text-main">
          Smart Suggestions — AI analyzed your content and found these specific improvements
        </p>
      </div>

      {recommendations.map((rec, i) => (
        <div
          key={`${rec.title}-${i}`}
          className="bg-card border border-border rounded-xl p-5"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              <Sparkles className="w-3 h-3" />
              AI Suggestion
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              {getCategoryLabel(rec.category)}
            </span>
          </div>

          {/* Title & Description */}
          <h3 className="font-semibold text-text-main mb-2">{rec.title}</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            {rec.description}
          </p>

          {/* Suggested rewrite */}
          {rec.suggested_rewrite && (
            <div className="mt-4">
              <p className="text-xs font-medium text-text-dim uppercase tracking-wider mb-2">
                Suggested rewrite
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-sm text-emerald-800 leading-relaxed whitespace-pre-wrap">
                  {rec.suggested_rewrite}
                </p>
              </div>
              <CopyButton text={rec.suggested_rewrite} />
            </div>
          )}

          {/* Code snippet */}
          {rec.code_snippet && (
            <div className="mt-4">
              <p className="text-xs font-medium text-text-dim uppercase tracking-wider mb-2">
                Ready-to-use code
              </p>
              <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                <pre className="text-sm text-emerald-400 whitespace-pre-wrap font-mono">
                  {rec.code_snippet}
                </pre>
              </div>
              <CopyButton text={rec.code_snippet} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
