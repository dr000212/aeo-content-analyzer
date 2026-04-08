"use client";

import { AnalyzeResponse, ModuleResult, Check } from "@/lib/types";
import {
  PILLAR_LABELS,
  PILLAR_WHAT_WE_CHECK,
  PILLAR_COLORS,
  CHECK_LABELS,
} from "@/lib/labels";

interface PillarScoresProps {
  data: AnalyzeResponse;
}

function getBarColor(score: number): string {
  if (score >= 75) return "from-emerald-400 to-emerald-500";
  if (score >= 50) return "from-amber-400 to-amber-500";
  return "from-red-400 to-red-500";
}

function CheckItem({ check }: { check: Check }) {
  const label = CHECK_LABELS[check.id];
  const text = label
    ? check.passed
      ? label.passed
      : label.failed
    : check.text;
  return (
    <li className="flex items-start gap-2 text-xs py-1">
      <span
        className={`mt-0.5 flex-shrink-0 ${
          check.passed ? "text-emerald-500" : "text-red-500"
        }`}
      >
        {check.passed ? "✓" : "✗"}
      </span>
      <span
        className={check.passed ? "text-text-muted" : "text-text-main font-medium"}
      >
        {text}
      </span>
    </li>
  );
}

function PillarRow({
  pillarKey,
  icon,
  name,
  tagline,
  score,
  weight,
  checks,
}: {
  pillarKey: string;
  icon: string;
  name: string;
  tagline: string;
  score: number;
  weight: number;
  checks: Check[];
}) {
  const failed = checks.filter((c) => !c.passed);
  const passed = checks.filter((c) => c.passed);
  const colors = PILLAR_COLORS[pillarKey];
  const barColor = getBarColor(score);

  return (
    <div
      id={`pillar-${pillarKey}`}
      className={`bg-card border-l-4 ${colors?.border || "border-blue-400"} border border-border rounded-xl p-4 scroll-mt-24`}
    >
      {/* Header row: icon + name + score + bar */}
      <div className="flex items-center gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-bold text-text-main text-sm">{name}</h3>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                colors?.light || "bg-blue-50"
              } ${colors?.text || "text-blue-600"}`}
            >
              {weight}% weight
            </span>
          </div>
          <p className="text-[11px] text-text-dim mt-0.5">{tagline}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-extrabold text-text-main leading-none">
            {score}
          </div>
          <div className="text-[10px] text-text-dim">/100</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Status line */}
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-emerald-600 font-medium">
          ✓ {passed.length} passed
        </span>
        {failed.length > 0 ? (
          <span className="text-amber-600 font-medium">
            ✗ {failed.length} need fixing
          </span>
        ) : (
          <span className="text-emerald-600 font-medium">All good 🎉</span>
        )}
      </div>

      {/* Failed checks listed straight */}
      {failed.length > 0 && (
        <ul className="mt-3 pt-3 border-t border-border space-y-0.5">
          {failed.map((c) => (
            <CheckItem key={c.id} check={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function GeoSubRow({
  subKey,
  result,
  weight,
}: {
  subKey: string;
  result: ModuleResult;
  weight: number;
}) {
  const failed = result.checks.filter((c) => !c.passed);
  const barColor = getBarColor(result.score);
  const labelMap: Record<string, { name: string; tagline: string }> = {
    structure: { name: "Content Structure", tagline: "Headings, paragraphs, organization" },
    schema_markup: { name: "Smart Tags", tagline: "Structured data for AI" },
    entity: { name: "Topic Depth", tagline: "Coverage of related concepts" },
    readability: { name: "Writing Quality", tagline: "Clarity, confidence, freshness" },
  };
  const info = labelMap[subKey];

  return (
    <div className="bg-white/60 rounded-lg p-3 border border-violet-100">
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-text-main">{info.name}</span>
            <span className="text-[9px] text-violet-600 font-bold">{weight}%</span>
          </div>
          <p className="text-[10px] text-text-dim">{info.tagline}</p>
        </div>
        <div className="text-lg font-extrabold text-violet-700 leading-none">
          {result.score}
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-violet-100 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
          style={{ width: `${result.score}%` }}
        />
      </div>
      {failed.length > 0 && (
        <p className="text-[10px] text-amber-700 mt-1.5">
          {failed.length} of {result.checks.length} need fixing
        </p>
      )}
    </div>
  );
}

export default function PillarScores({ data }: PillarScoresProps) {
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

  const geoColors = PILLAR_COLORS.geo_readiness;
  const geoFailed = data.geo_readiness.checks.filter((c) => !c.passed);
  const geoPassed = data.geo_readiness.checks.filter((c) => c.passed);
  const geoBar = getBarColor(data.geo_readiness.score);

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-text-main flex items-center gap-2">
        <span>📊</span> Detailed breakdown
        <span className="text-xs font-normal text-text-dim">
          — full scores for every pillar
        </span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pillars.map((p) => (
          <PillarRow
            key={p.key}
            pillarKey={p.key}
            icon={p.icon}
            name={p.name}
            tagline={p.tagline}
            score={p.score}
            weight={p.weight}
            checks={p.checks}
          />
        ))}
      </div>

      {/* GEO pillar — full row with sub-modules always visible */}
      <div
        id="pillar-geo_readiness"
        className={`bg-card border-l-4 ${geoColors.border} border border-border rounded-xl p-4 scroll-mt-24`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">{PILLAR_LABELS.geo_readiness.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="font-bold text-text-main text-sm">
                {PILLAR_LABELS.geo_readiness.name}
              </h3>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${geoColors.light} ${geoColors.text}`}
              >
                {PILLAR_WHAT_WE_CHECK.geo_readiness.weight}% weight (largest)
              </span>
            </div>
            <p className="text-[11px] text-text-dim mt-0.5">
              {PILLAR_LABELS.geo_readiness.tagline}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-extrabold text-text-main leading-none">
              {data.geo_readiness.score}
            </div>
            <div className="text-[10px] text-text-dim">/100</div>
          </div>
        </div>

        <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${geoBar} transition-all duration-700`}
            style={{ width: `${data.geo_readiness.score}%` }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-emerald-600 font-medium">
            ✓ {geoPassed.length} passed
          </span>
          {geoFailed.length > 0 && (
            <span className="text-amber-600 font-medium">
              ✗ {geoFailed.length} need fixing
            </span>
          )}
        </div>

        {/* GEO sub-modules — always visible, straight */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <GeoSubRow subKey="structure" result={data.geo_readiness.structure} weight={30} />
          <GeoSubRow subKey="schema_markup" result={data.geo_readiness.schema_markup} weight={25} />
          <GeoSubRow subKey="entity" result={data.geo_readiness.entity} weight={25} />
          <GeoSubRow subKey="readability" result={data.geo_readiness.readability} weight={20} />
        </div>

        {geoFailed.length > 0 && (
          <ul className="mt-3 pt-3 border-t border-border space-y-0.5">
            {geoFailed.map((c) => (
              <CheckItem key={c.id} check={c} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
