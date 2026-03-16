"use client";

import ScoreRing from "./ScoreRing";
import { AnalyzeResponse } from "@/lib/types";

interface ScoreOverviewProps {
  data: AnalyzeResponse;
}

export default function ScoreOverview({ data }: ScoreOverviewProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Overall Score */}
        <div className="flex flex-col items-center gap-2">
          <ScoreRing score={data.overall_score} size={140} strokeWidth={10} />
          <span className="text-lg font-bold text-text-main">
            {data.grade}
          </span>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-32 bg-border" />

        {/* 5 Pillar Scores */}
        <div className="flex-1">
          {/* SEO Pillars */}
          <p className="text-xs font-medium text-text-dim uppercase tracking-wider mb-3">SEO Pillars</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <ScoreRing
              score={data.technical_seo.score}
              size={72}
              strokeWidth={5}
              label="Technical"
              sublabel="15%"
            />
            <ScoreRing
              score={data.onpage_seo.score}
              size={72}
              strokeWidth={5}
              label="On-Page"
              sublabel="20%"
            />
            <ScoreRing
              score={data.link_analysis.score}
              size={72}
              strokeWidth={5}
              label="Links"
              sublabel="10%"
            />
            <ScoreRing
              score={data.performance.score}
              size={72}
              strokeWidth={5}
              label="Performance"
              sublabel="20%"
            />
          </div>

          {/* GEO Pillar */}
          <p className="text-xs font-medium text-text-dim uppercase tracking-wider mb-3">GEO Readiness (35%)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ScoreRing
              score={data.geo_readiness.structure.score}
              size={64}
              strokeWidth={5}
              label="Structure"
              sublabel="30%"
            />
            <ScoreRing
              score={data.geo_readiness.schema_markup.score}
              size={64}
              strokeWidth={5}
              label="Schema"
              sublabel="25%"
            />
            <ScoreRing
              score={data.geo_readiness.entity.score}
              size={64}
              strokeWidth={5}
              label="Entity"
              sublabel="25%"
            />
            <ScoreRing
              score={data.geo_readiness.readability.score}
              size={64}
              strokeWidth={5}
              label="Readability"
              sublabel="20%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
