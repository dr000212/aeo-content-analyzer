"use client";

import ScoreRing from "./ScoreRing";
import { AnalyzeResponse } from "@/lib/types";
import { GRADE_DESCRIPTIONS } from "@/lib/labels";
import { Clock, Database } from "lucide-react";

interface ScoreHeroProps {
  data: AnalyzeResponse;
}

export default function ScoreHero({ data }: ScoreHeroProps) {
  const totalChecks = data.checks.length;
  const passedChecks = data.checks.filter((c) => c.passed).length;

  return (
    <div className="bg-card border border-border rounded-xl p-6 sm:p-8 text-center">
      <p className="text-sm font-medium text-text-dim uppercase tracking-wider mb-4">
        Website Health Score
      </p>

      <div className="flex justify-center mb-4">
        <ScoreRing score={data.overall_score} size={150} strokeWidth={10} />
      </div>

      <p className="text-xl font-bold text-text-main mb-2">
        {data.grade}{" "}
        {data.overall_score >= 75 ? "👍" : data.overall_score >= 50 ? "👌" : data.overall_score >= 25 ? "👀" : "⚠️"}
      </p>

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
    </div>
  );
}
