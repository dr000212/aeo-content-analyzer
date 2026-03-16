"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ScoreRing from "./ScoreRing";
import Tooltip from "./Tooltip";
import { AnalyzeResponse, ModuleResult } from "@/lib/types";
import { PILLAR_LABELS, GEO_SUB_LABELS, CHECK_LABELS } from "@/lib/labels";

interface OverviewTabProps {
  data: AnalyzeResponse;
}

function getScoreColor(score: number) {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function PillarDetailCard({
  icon,
  name,
  tagline,
  description,
  result,
}: {
  icon: string;
  name: string;
  tagline: string;
  description: string;
  result: ModuleResult;
}) {
  const failed = result.checks.filter((c) => !c.passed);
  const passed = result.checks.filter((c) => c.passed);

  // Generate a 1-2 sentence summary
  const summary =
    failed.length === 0
      ? `Great job! All ${result.checks.length} checks passed.`
      : failed.length <= 2
      ? `Almost there — just ${failed.length} thing${failed.length > 1 ? "s" : ""} to fix.`
      : `Found ${failed.length} issues that need attention out of ${result.checks.length} checks.`;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-text-main text-sm">{name}</h3>
              <Tooltip text={description} />
            </div>
            <p className="text-xs text-text-dim">{tagline}</p>
          </div>
        </div>
        <div className={`text-lg font-bold ${getScoreColor(result.score)}`}>
          {result.score}/100
        </div>
      </div>

      <p className="text-sm text-text-muted mb-3">{summary}</p>

      <div className="space-y-2">
        {/* Show top 3 failed */}
        {failed.slice(0, 3).map((check) => {
          const label = CHECK_LABELS[check.id];
          return (
            <div key={check.id} className="flex items-start gap-2 text-sm">
              <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
              <span className="text-text-muted">
                {label ? label.failed : check.text}
              </span>
            </div>
          );
        })}
        {/* Show top 2 passed */}
        {passed.slice(0, 2).map((check) => {
          const label = CHECK_LABELS[check.id];
          return (
            <div key={check.id} className="flex items-start gap-2 text-sm">
              <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
              <span className="text-text-muted">
                {label ? label.passed : check.text}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-text-dim">
          {passed.length}/{result.checks.length} checks passed
        </p>
      </div>
    </div>
  );
}

export default function OverviewTab({ data }: OverviewTabProps) {
  const [geoExpanded, setGeoExpanded] = useState(true);

  const seoPillars = [
    { ...PILLAR_LABELS.technical_seo, result: data.technical_seo },
    { ...PILLAR_LABELS.onpage_seo, result: data.onpage_seo },
    { ...PILLAR_LABELS.links, result: data.link_analysis },
    { ...PILLAR_LABELS.performance, result: data.performance },
  ];

  const geoModules = [
    { ...GEO_SUB_LABELS.structure, icon: "📐", result: data.geo_readiness.structure },
    { ...GEO_SUB_LABELS.schema_markup, icon: "🏷️", result: data.geo_readiness.schema_markup },
    { ...GEO_SUB_LABELS.entity, icon: "🎯", result: data.geo_readiness.entity },
    { ...GEO_SUB_LABELS.readability, icon: "✍️", result: data.geo_readiness.readability },
  ];

  return (
    <div className="space-y-6">
      {/* SEO Pillars */}
      <div>
        <h2 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-3">
          Search Visibility
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seoPillars.map((p) => (
            <PillarDetailCard
              key={p.name}
              icon={p.icon}
              name={p.name}
              tagline={p.tagline}
              description={p.description}
              result={p.result}
            />
          ))}
        </div>
      </div>

      {/* AI Readiness */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-dim uppercase tracking-wider">
            AI Readiness
          </h2>
          <button
            onClick={() => setGeoExpanded(!geoExpanded)}
            className="flex items-center gap-1 text-xs text-primary font-medium hover:text-blue-600 transition-colors"
          >
            {geoExpanded ? (
              <>Collapse <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Expand <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
        {geoExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {geoModules.map((m) => (
              <PillarDetailCard
                key={m.name}
                icon={m.icon}
                name={m.name}
                tagline={m.tagline}
                description={m.description}
                result={m.result}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
