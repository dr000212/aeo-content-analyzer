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

        {/* Module Scores */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
          <ScoreRing
            score={data.structure.score}
            size={80}
            strokeWidth={6}
            label="Structure"
            sublabel="30% weight"
          />
          <ScoreRing
            score={data.schema_markup.score}
            size={80}
            strokeWidth={6}
            label="Schema"
            sublabel="25% weight"
          />
          <ScoreRing
            score={data.entity.score}
            size={80}
            strokeWidth={6}
            label="Entity"
            sublabel="25% weight"
          />
          <ScoreRing
            score={data.readability.score}
            size={80}
            strokeWidth={6}
            label="Readability"
            sublabel="20% weight"
          />
        </div>
      </div>
    </div>
  );
}
