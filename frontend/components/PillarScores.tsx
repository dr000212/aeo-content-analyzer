"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ScoreRing from "./ScoreRing";
import Tooltip from "./Tooltip";
import { AnalyzeResponse, ModuleResult, Check } from "@/lib/types";
import {
  PILLAR_LABELS,
  GEO_SUB_LABELS,
  PILLAR_WHAT_WE_CHECK,
  GEO_SUB_WHAT_WE_CHECK,
  PILLAR_COLORS,
  CHECK_LABELS,
} from "@/lib/labels";

interface PillarScoresProps {
  data: AnalyzeResponse;
}

function CheckListInline({ checks }: { checks: Check[] }) {
  const [showPassed, setShowPassed] = useState(false);
  const failed = checks.filter((c) => !c.passed);
  const passed = checks.filter((c) => c.passed);

  return (
    <div className="mt-3 pt-3 border-t border-border animate-fade-in">
      {/* Failed checks */}
      {failed.length > 0 && (
        <div className="space-y-1.5 mb-3">
          <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wider">
            Needs attention ({failed.length})
          </p>
          {failed.map((check) => {
            const label = CHECK_LABELS[check.id];
            return (
              <div key={check.id} className="group">
                <div className="flex items-start gap-2 text-xs py-1">
                  <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                  <div className="flex-1">
                    <span className="text-text-main font-medium">
                      {label ? label.failed : check.text}
                    </span>
                    {label && (
                      <p className="text-text-dim mt-0.5 leading-relaxed">
                        💡 {label.why}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Passed checks */}
      {passed.length > 0 && (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPassed(!showPassed);
            }}
            className="text-[11px] text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
          >
            {showPassed
              ? `Hide ${passed.length} passed checks`
              : `Show ${passed.length} passed checks ✓`}
          </button>
          {showPassed && (
            <div className="mt-1.5 space-y-1 animate-fade-in">
              {passed.map((check) => {
                const label = CHECK_LABELS[check.id];
                return (
                  <div key={check.id} className="flex items-start gap-2 text-xs py-0.5">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-text-muted">
                      {label ? label.passed : check.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {failed.length === 0 && (
        <p className="text-xs text-emerald-600 font-medium py-1">
          All checks passed! 🎉
        </p>
      )}
    </div>
  );
}

function PillarCard({
  pillarKey,
  icon,
  name,
  tagline,
  description,
  score,
  weight,
  checks,
}: {
  pillarKey: string;
  icon: string;
  name: string;
  tagline: string;
  description: string;
  score: number;
  weight: number;
  checks: Check[];
}) {
  const [expanded, setExpanded] = useState(false);
  const failedCount = checks.filter((c) => !c.passed).length;
  const colors = PILLAR_COLORS[pillarKey];

  return (
    <div
      className={`bg-card border-l-4 ${colors?.border || "border-blue-400"} border border-border rounded-xl p-4 transition-all duration-200`}
    >
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
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors?.light || "bg-blue-50"} ${colors?.text || "text-blue-600"}`}>
          {weight}% of your score
        </span>
        {failedCount > 0 ? (
          <span className="text-xs text-amber-600 font-medium">
            {failedCount} of {checks.length} need attention
          </span>
        ) : (
          <span className="text-xs text-emerald-600 font-medium">
            All {checks.length} checks passed
          </span>
        )}
      </div>

      {/* Expandable check list */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-primary font-medium mt-3 hover:text-purple-600 transition-colors"
      >
        {expanded ? (
          <>Hide checks <ChevronUp className="w-3.5 h-3.5" /></>
        ) : (
          <>What we check <ChevronDown className="w-3.5 h-3.5" /></>
        )}
      </button>

      {expanded && <CheckListInline checks={checks} />}
    </div>
  );
}

function GeoSubModule({
  subKey,
  name,
  tagline,
  description,
  result,
  weight,
}: {
  subKey: string;
  name: string;
  tagline: string;
  description: string;
  result: ModuleResult;
  weight: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const failed = result.checks.filter((c) => !c.passed).length;

  return (
    <div className="py-2">
      <div className="flex items-center gap-3">
        <ScoreRing score={result.score} size={40} strokeWidth={3} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-text-main">{name}</span>
            <Tooltip text={description} />
          </div>
          <p className="text-xs text-text-dim">{tagline}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">
            {weight}%
          </span>
          {failed > 0 && (
            <p className="text-xs text-amber-600 mt-0.5">{failed} to fix</p>
          )}
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[11px] text-primary font-medium mt-1.5 ml-[52px] hover:text-purple-600 transition-colors"
      >
        {expanded ? (
          <>Hide checks <ChevronUp className="w-3 h-3" /></>
        ) : (
          <>See checks <ChevronDown className="w-3 h-3" /></>
        )}
      </button>

      {expanded && <CheckListInline checks={result.checks} />}
    </div>
  );
}

export default function PillarScores({ data }: PillarScoresProps) {
  const [geoExpanded, setGeoExpanded] = useState(false);

  const pillars = [
    {
      key: "technical_seo",
      ...PILLAR_LABELS.technical_seo,
      score: data.technical_seo.score,
      weight: PILLAR_WHAT_WE_CHECK.technical_seo.weight,
      checks: data.technical_seo.checks,
    },
    {
      key: "onpage_seo",
      ...PILLAR_LABELS.onpage_seo,
      score: data.onpage_seo.score,
      weight: PILLAR_WHAT_WE_CHECK.onpage_seo.weight,
      checks: data.onpage_seo.checks,
    },
    {
      key: "links",
      ...PILLAR_LABELS.links,
      score: data.link_analysis.score,
      weight: PILLAR_WHAT_WE_CHECK.links.weight,
      checks: data.link_analysis.checks,
    },
    {
      key: "performance",
      ...PILLAR_LABELS.performance,
      score: data.performance.score,
      weight: PILLAR_WHAT_WE_CHECK.performance.weight,
      checks: data.performance.checks,
    },
  ];

  const geoFailed = data.geo_readiness.checks.filter((c) => !c.passed).length;
  const geoTotal = data.geo_readiness.checks.length;
  const geoColors = PILLAR_COLORS.geo_readiness;

  return (
    <div className="space-y-3">
      {/* SEO Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pillars.map((p) => (
          <PillarCard
            key={p.key}
            pillarKey={p.key}
            icon={p.icon}
            name={p.name}
            tagline={p.tagline}
            description={p.description}
            score={p.score}
            weight={p.weight}
            checks={p.checks}
          />
        ))}
      </div>

      {/* GEO Pillar (expandable) */}
      <div className={`bg-card border-l-4 ${geoColors.border} border border-border rounded-xl p-4`}>
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
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${geoColors.light} ${geoColors.text}`}>
            {PILLAR_WHAT_WE_CHECK.geo_readiness.weight}% of your score
          </span>
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
          className="flex items-center gap-1 text-xs text-primary font-medium mt-3 hover:text-purple-600 transition-colors"
        >
          {geoExpanded ? (
            <>Hide details <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>See details <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>

        {geoExpanded && (
          <div className="mt-3 pt-3 border-t border-border space-y-1 divide-y divide-border animate-fade-in">
            <GeoSubModule
              subKey="structure"
              {...GEO_SUB_LABELS.structure}
              result={data.geo_readiness.structure}
              weight={GEO_SUB_WHAT_WE_CHECK.structure.weight}
            />
            <GeoSubModule
              subKey="schema_markup"
              {...GEO_SUB_LABELS.schema_markup}
              result={data.geo_readiness.schema_markup}
              weight={GEO_SUB_WHAT_WE_CHECK.schema_markup.weight}
            />
            <GeoSubModule
              subKey="entity"
              {...GEO_SUB_LABELS.entity}
              result={data.geo_readiness.entity}
              weight={GEO_SUB_WHAT_WE_CHECK.entity.weight}
            />
            <GeoSubModule
              subKey="readability"
              {...GEO_SUB_LABELS.readability}
              result={data.geo_readiness.readability}
              weight={GEO_SUB_WHAT_WE_CHECK.readability.weight}
            />
          </div>
        )}
      </div>
    </div>
  );
}
