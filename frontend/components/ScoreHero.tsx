"use client";

import ScoreRing from "./ScoreRing";
import ScoringExplainer from "./ScoringExplainer";
import Logo from "./Logo";
import { AnalyzeResponse } from "@/lib/types";
import { GRADE_DESCRIPTIONS } from "@/lib/labels";
import { Clock, Database } from "lucide-react";

interface ScoreHeroProps {
  data: AnalyzeResponse;
}

function getGradeBadge(score: number): { emoji: string; bg: string; text: string } {
  if (score >= 75) return { emoji: "👍", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" };
  if (score >= 50) return { emoji: "👌", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" };
  if (score >= 25) return { emoji: "👀", bg: "bg-orange-50 border-orange-200", text: "text-orange-700" };
  return { emoji: "⚠️", bg: "bg-red-50 border-red-200", text: "text-red-700" };
}

export default function ScoreHero({ data }: ScoreHeroProps) {
  const totalChecks = data.checks.length;
  const passedChecks = data.checks.filter((c) => c.passed).length;
  const badge = getGradeBadge(data.overall_score);

  return (
    <div className="bg-card border border-border rounded-xl p-6 sm:p-8 text-center hero-glow relative overflow-hidden">
      {/* Subtle gradient accent at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-accent" />

      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary via-purple-500 to-accent flex items-center justify-center">
          <Logo size={14} />
        </div>
        <p className="text-sm font-medium text-text-dim uppercase tracking-wider">
          Website Health Score
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <ScoreRing score={data.overall_score} size={150} strokeWidth={10} />
      </div>

      <div className="inline-flex items-center gap-2 mb-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${badge.bg} ${badge.text}`}>
          {badge.emoji} {data.grade}
        </span>
      </div>

      <p className="text-sm text-text-muted max-w-lg mx-auto mb-4">
        {GRADE_DESCRIPTIONS[data.grade] || ""}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-text-dim">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Analyzed in {(data.analysis_time_ms / 1000).toFixed(1)} seconds
        </div>
        <span>·</span>
        <span>{passedChecks} of {totalChecks} checks passed</span>
        {data.cached && (
          <>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Using recent results
            </div>
          </>
        )}
      </div>

      <ScoringExplainer />
    </div>
  );
}
