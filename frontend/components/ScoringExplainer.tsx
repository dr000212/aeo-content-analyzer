"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import { PILLAR_LABELS, PILLAR_WHAT_WE_CHECK, GEO_SUB_LABELS, GEO_SUB_WHAT_WE_CHECK } from "@/lib/labels";

const pillars = [
  { key: "technical_seo", color: "bg-blue-500" },
  { key: "onpage_seo", color: "bg-purple-500" },
  { key: "links", color: "bg-emerald-500" },
  { key: "performance", color: "bg-amber-500" },
  { key: "geo_readiness", color: "bg-violet-500" },
] as const;

const geoSubs = ["structure", "schema_markup", "entity", "readability"] as const;

export default function ScoringExplainer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-purple-600 font-medium transition-colors mx-auto"
      >
        <Info className="w-3.5 h-3.5" />
        How is this score calculated?
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 bg-gradient-to-br from-slate-50 to-indigo-50 border border-indigo-100 rounded-xl p-5 text-left animate-slide-down">
          <p className="text-sm text-text-muted leading-relaxed mb-4">
            Your overall score is a <span className="font-semibold text-text-main">weighted average</span> of
            5 areas. Each area counts differently based on how much it impacts your visibility to search engines and AI.
          </p>

          {/* Weight bars */}
          <div className="space-y-2.5">
            {pillars.map((p) => {
              const label = PILLAR_LABELS[p.key];
              const info = PILLAR_WHAT_WE_CHECK[p.key];
              return (
                <div key={p.key} className="flex items-center gap-3">
                  <span className="text-sm w-6 text-center">{label.icon}</span>
                  <span className="text-xs font-medium text-text-main w-32 flex-shrink-0">
                    {label.name}
                  </span>
                  <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${p.color} rounded-full h-2.5 transition-all duration-500`}
                      style={{ width: `${info.weight * 2.85}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-text-main w-8 text-right">
                    {info.weight}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* AI Readiness sub-breakdown */}
          <div className="mt-4 pt-4 border-t border-indigo-200">
            <p className="text-xs font-semibold text-violet-700 mb-2">
              🤖 AI Readiness is made up of 4 sub-areas:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {geoSubs.map((sub) => {
                const subLabel = GEO_SUB_LABELS[sub];
                const subInfo = GEO_SUB_WHAT_WE_CHECK[sub];
                return (
                  <div key={sub} className="flex items-center gap-2 bg-violet-50 rounded-lg px-2.5 py-1.5">
                    <span className="text-xs font-medium text-violet-700">{subLabel.name}</span>
                    <span className="text-[10px] font-bold text-violet-500 ml-auto">{subInfo.weight}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-text-dim mt-4 leading-relaxed">
            The more checks you pass in a high-weight area, the bigger the boost to your overall score.
            Focus on fixing issues in <span className="font-medium">AI Readiness</span> and{" "}
            <span className="font-medium">Page Speed</span> for the biggest impact.
          </p>
        </div>
      )}
    </div>
  );
}
