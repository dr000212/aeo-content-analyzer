"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ScoreRing from "./ScoreRing";
import Tooltip from "./Tooltip";
import { AnalyzeResponse, ModuleResult } from "@/lib/types";
import { PILLAR_LABELS, GEO_SUB_LABELS } from "@/lib/labels";

interface PillarScoresProps {
  data: AnalyzeResponse;
}

function PillarCard({
  icon,
  name,
  tagline,
  description,
  score,
  weight,
  failedCount,
  totalCount,
}: {
  icon: string;
  name: string;
  tagline: string;
  description: string;
  score: number;
  weight: string;
  failedCount: number;
  totalCount: number;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-text-main text-sm">{name}</h3>
            <Tooltip text={description} />
          </div>
          <p className="text-xs text-text-dim mt-0.5">{tagline}</p>
        </div>
        <ScoreRing score={score} size={56} strokeWidth={4} />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-xs text-text-dim">{weight} of your score</span>
        {failedCount > 0 ? (
          <span className="text-xs text-amber-600 font-medium">
            {failedCount} of {totalCount} checks need attention
          </span>
        ) : (
          <span className="text-xs text-emerald-600 font-medium">
            All {totalCount} checks passed
          </span>
        )}
      </div>
    </div>
  );
}

function GeoSubModule({
  name,
  tagline,
  description,
  result,
  weight,
}: {
  name: string;
  tagline: string;
  description: string;
  result: ModuleResult;
  weight: string;
}) {
  const failed = result.checks.filter((c) => !c.passed).length;
  return (
    <div className="flex items-center gap-3 py-2">
      <ScoreRing score={result.score} size={40} strokeWidth={3} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-text-main">{name}</span>
          <Tooltip text={description} />
        </div>
        <p className="text-xs text-text-dim">{tagline}</p>
      </div>
      <div className="text-right">
        <span className="text-xs text-text-dim">{weight}</span>
        {failed > 0 && (
          <p className="text-xs text-amber-600">{failed} to fix</p>
        )}
      </div>
    </div>
  );
}

export default function PillarScores({ data }: PillarScoresProps) {
  const [geoExpanded, setGeoExpanded] = useState(false);

  const pillars = [
    {
      ...PILLAR_LABELS.technical_seo,
      score: data.technical_seo.score,
      weight: "15%",
      checks: data.technical_seo.checks,
    },
    {
      ...PILLAR_LABELS.onpage_seo,
      score: data.onpage_seo.score,
      weight: "20%",
      checks: data.onpage_seo.checks,
    },
    {
      ...PILLAR_LABELS.links,
      score: data.link_analysis.score,
      weight: "10%",
      checks: data.link_analysis.checks,
    },
    {
      ...PILLAR_LABELS.performance,
      score: data.performance.score,
      weight: "20%",
      checks: data.performance.checks,
    },
  ];

  const geoFailed = data.geo_readiness.checks.filter((c) => !c.passed).length;
  const geoTotal = data.geo_readiness.checks.length;

  return (
    <div className="space-y-3">
      {/* SEO Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pillars.map((p) => (
          <PillarCard
            key={p.name}
            icon={p.icon}
            name={p.name}
            tagline={p.tagline}
            description={p.description}
            score={p.score}
            weight={p.weight}
            failedCount={p.checks.filter((c) => !c.passed).length}
            totalCount={p.checks.length}
          />
        ))}
      </div>

      {/* GEO Pillar (expandable) */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">{PILLAR_LABELS.geo_readiness.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-text-main text-sm">{PILLAR_LABELS.geo_readiness.name}</h3>
              <Tooltip text={PILLAR_LABELS.geo_readiness.description} />
            </div>
            <p className="text-xs text-text-dim mt-0.5">{PILLAR_LABELS.geo_readiness.tagline}</p>
          </div>
          <ScoreRing score={data.geo_readiness.score} size={56} strokeWidth={4} />
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-xs text-text-dim">35% of your score</span>
          {geoFailed > 0 ? (
            <span className="text-xs text-amber-600 font-medium">
              {geoFailed} of {geoTotal} checks need attention
            </span>
          ) : (
            <span className="text-xs text-emerald-600 font-medium">
              All {geoTotal} checks passed
            </span>
          )}
        </div>

        <button
          onClick={() => setGeoExpanded(!geoExpanded)}
          className="flex items-center gap-1 text-xs text-primary font-medium mt-3 hover:text-blue-600 transition-colors"
        >
          {geoExpanded ? (
            <>Hide details <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>See details <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>

        {geoExpanded && (
          <div className="mt-3 pt-3 border-t border-border space-y-1 divide-y divide-border">
            <GeoSubModule
              {...GEO_SUB_LABELS.structure}
              result={data.geo_readiness.structure}
              weight="30%"
            />
            <GeoSubModule
              {...GEO_SUB_LABELS.schema_markup}
              result={data.geo_readiness.schema_markup}
              weight="25%"
            />
            <GeoSubModule
              {...GEO_SUB_LABELS.entity}
              result={data.geo_readiness.entity}
              weight="25%"
            />
            <GeoSubModule
              {...GEO_SUB_LABELS.readability}
              result={data.geo_readiness.readability}
              weight="20%"
            />
          </div>
        )}
      </div>
    </div>
  );
}
