"use client";

import { useState } from "react";
import ScoreRing from "./ScoreRing";
import ScoringExplainer from "./ScoringExplainer";
import { AnalyzeResponse } from "@/lib/types";
import { GRADE_DESCRIPTIONS, PILLAR_LABELS, PILLAR_WHAT_WE_CHECK } from "@/lib/labels";
import { CheckCircle2, AlertTriangle, Flame, MessageCircle } from "lucide-react";

interface ScoreDashboardProps {
  data: AnalyzeResponse;
}

interface TileSpec {
  key: string;
  icon: string;
  name: string;
  score: number;
  weight: number;
  failed: number;
  total: number;
  gradient: string;
  ring: string;
  light: string;
  text: string;
  border: string;
}

function getGradeBadge(score: number) {
  if (score >= 75) return { emoji: "🎉", label: "Excellent", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300" };
  if (score >= 50) return { emoji: "👍", label: "Good", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" };
  if (score >= 25) return { emoji: "👀", label: "Needs Work", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300" };
  return { emoji: "⚠️", label: "Needs Attention", bg: "bg-red-50", text: "text-red-700", border: "border-red-300" };
}

function PillarTile({
  tile,
  isActive,
  onClick,
}: {
  tile: TileSpec;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative text-left rounded-xl p-3 border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
        isActive
          ? `${tile.border} ${tile.light} shadow-md scale-[1.02]`
          : "border-border bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Gradient accent strip */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tile.gradient}`} />

      <div className="flex items-start gap-2">
        <span className="text-xl leading-none">{tile.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-text-main leading-tight truncate">
            {tile.name}
          </p>
          <p className="text-[9px] text-text-dim mt-0.5">{tile.weight}% weight</p>
        </div>
        <span className={`text-base font-extrabold ${tile.text}`}>{tile.score}</span>
      </div>

      {/* Mini progress bar */}
      <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tile.gradient} transition-all duration-700`}
          style={{ width: `${tile.score}%` }}
        />
      </div>

      {/* Failed badge */}
      {tile.failed > 0 ? (
        <p className="text-[10px] text-amber-700 mt-1.5 font-medium">
          {tile.failed}/{tile.total} need fixing
        </p>
      ) : (
        <p className="text-[10px] text-emerald-600 mt-1.5 font-medium">
          ✓ All {tile.total} passed
        </p>
      )}
    </button>
  );
}

export default function ScoreDashboard({ data }: ScoreDashboardProps) {
  const [activeTile, setActiveTile] = useState<string | null>(null);

  const totalChecks = data.checks.length;
  const passedChecks = data.checks.filter((c) => c.passed).length;
  const failedChecks = totalChecks - passedChecks;
  const criticalChecks = data.checks.filter(
    (c) => !c.passed && c.impact === "High"
  ).length;
  const badge = getGradeBadge(data.overall_score);

  const tiles: TileSpec[] = [
    {
      key: "technical_seo",
      icon: PILLAR_LABELS.technical_seo.icon,
      name: PILLAR_LABELS.technical_seo.name,
      score: data.technical_seo.score,
      weight: PILLAR_WHAT_WE_CHECK.technical_seo.weight,
      failed: data.technical_seo.checks.filter((c) => !c.passed).length,
      total: data.technical_seo.checks.length,
      gradient: "from-blue-500 to-cyan-400",
      ring: "ring-blue-300",
      light: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-300",
    },
    {
      key: "onpage_seo",
      icon: PILLAR_LABELS.onpage_seo.icon,
      name: PILLAR_LABELS.onpage_seo.name,
      score: data.onpage_seo.score,
      weight: PILLAR_WHAT_WE_CHECK.onpage_seo.weight,
      failed: data.onpage_seo.checks.filter((c) => !c.passed).length,
      total: data.onpage_seo.checks.length,
      gradient: "from-purple-500 to-pink-400",
      ring: "ring-purple-300",
      light: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-300",
    },
    {
      key: "links",
      icon: PILLAR_LABELS.links.icon,
      name: "Link Health",
      score: data.link_analysis.score,
      weight: PILLAR_WHAT_WE_CHECK.links.weight,
      failed: data.link_analysis.checks.filter((c) => !c.passed).length,
      total: data.link_analysis.checks.length,
      gradient: "from-emerald-500 to-teal-400",
      ring: "ring-emerald-300",
      light: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-300",
    },
    {
      key: "performance",
      icon: PILLAR_LABELS.performance.icon,
      name: "Page Speed",
      score: data.performance.score,
      weight: PILLAR_WHAT_WE_CHECK.performance.weight,
      failed: data.performance.checks.filter((c) => !c.passed).length,
      total: data.performance.checks.length,
      gradient: "from-amber-500 to-orange-400",
      ring: "ring-amber-300",
      light: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-300",
    },
    {
      key: "geo_readiness",
      icon: PILLAR_LABELS.geo_readiness.icon,
      name: "AI Readiness",
      score: data.geo_readiness.score,
      weight: PILLAR_WHAT_WE_CHECK.geo_readiness.weight,
      failed: data.geo_readiness.checks.filter((c) => !c.passed).length,
      total: data.geo_readiness.checks.length,
      gradient: "from-violet-500 to-fuchsia-500",
      ring: "ring-violet-300",
      light: "bg-violet-50",
      text: "text-violet-700",
      border: "border-violet-300",
    },
  ];

  const handleTileClick = (key: string) => {
    setActiveTile(key);
    const target = document.getElementById(`pillar-${key}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const scrollToChat = () => {
    document.getElementById("seo-chat")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 hero-glow relative overflow-hidden">
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-accent" />

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-start">
        {/* Left: Big score ring + grade */}
        <div className="flex flex-col items-center text-center lg:pr-6 lg:border-r lg:border-border">
          <p className="text-[11px] font-semibold text-text-dim uppercase tracking-wider mb-2">
            Overall Score
          </p>
          <ScoreRing score={data.overall_score} size={170} strokeWidth={12} />
          <span
            className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.emoji} {badge.label}
          </span>
          <p className="text-xs text-text-muted max-w-[200px] mt-2 leading-relaxed">
            {GRADE_DESCRIPTIONS[data.grade] || ""}
          </p>
        </div>

        {/* Right: Pillar tiles + stats */}
        <div className="space-y-4">
          {/* Stats strip */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">
                {passedChecks} passed
              </span>
            </div>
            {failedChecks > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">
                  {failedChecks} to fix
                </span>
              </div>
            )}
            {criticalChecks > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
                <Flame className="w-3.5 h-3.5 text-red-600" />
                <span className="text-xs font-semibold text-red-700">
                  {criticalChecks} critical
                </span>
              </div>
            )}
            <div className="ml-auto text-[11px] text-text-dim">
              click any tile to jump ↓
            </div>
          </div>

          {/* Pillar tiles grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {tiles.map((tile) => (
              <PillarTile
                key={tile.key}
                tile={tile}
                isActive={activeTile === tile.key}
                onClick={() => handleTileClick(tile.key)}
              />
            ))}
          </div>

          {/* Chat CTA */}
          <button
            onClick={scrollToChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-primary via-purple-600 to-accent text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99] transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            Ask our AI Expert how to fix these issues
            <span className="text-base">→</span>
          </button>
        </div>
      </div>

      {/* How is this calculated? */}
      <div className="mt-4 pt-4 border-t border-border">
        <ScoringExplainer />
      </div>
    </div>
  );
}
