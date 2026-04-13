"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check as CheckIcon } from "lucide-react";
import { Recommendation } from "@/lib/types";
import { PRIORITY_LABELS, EFFORT_LABELS } from "@/lib/labels";

interface FixesTabProps {
  recommendations: Recommendation[];
}

function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    "Technical SEO": "Site Foundation",
    "On-Page SEO": "Content Optimization",
    Links: "Link Health",
    Performance: "Page Speed",
    Structure: "Content Structure",
    Schema: "Smart Tags",
    Entity: "Topic Depth",
    Readability: "Writing Quality",
  };
  return map[category] || category;
}

function getPriorityStyle(priority: string) {
  const p = PRIORITY_LABELS[priority];
  if (!p) return { label: priority, bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" };
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    gray: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  };
  const s = styles[p.color] || styles.gray;
  return { label: p.label, ...s };
}

function FixCard({ rec }: { rec: Recommendation }) {
  const style = getPriorityStyle(rec.priority);
  const effort = EFFORT_LABELS[rec.effort] || rec.effort;

  return (
    <div className={`bg-card border rounded-xl p-5 border-l-4 transition-all hover:shadow-md ${
      rec.priority === "Critical" ? "border-l-red-500 border-red-200" :
      rec.priority === "High" ? "border-l-amber-400 border-amber-200" :
      rec.priority === "Low" ? "border-l-blue-400 border-blue-200" :
      "border-l-slate-300 border-border"
    }`}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}
        >
          {style.label}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          {getCategoryLabel(rec.category)}
        </span>
        <span className="text-xs text-text-dim font-medium">⏱ {effort}</span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-text-main mb-2 text-base">{rec.title}</h3>

      {/* Description */}
      <p className="text-sm text-text-muted leading-relaxed">{rec.description}</p>

      {/* Impact estimate with visual bar */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-text-dim">Score impact</span>
          <span className="text-xs font-bold text-primary">+{rec.impact_score} pts</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-400 transition-all duration-500"
            style={{ width: `${Math.min(rec.impact_score * 5, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function FixesTab({ recommendations }: FixesTabProps) {
  const [filter, setFilter] = useState<string>("all");

  const filters = [
    { key: "all", label: "All" },
    { key: "quick", label: "Quick fixes" },
    { key: "important", label: "Important" },
    { key: "nice", label: "Nice to have" },
  ];

  const filtered = recommendations.filter((rec) => {
    if (filter === "all") return true;
    if (filter === "quick") return rec.effort === "Low";
    if (filter === "important") return rec.priority === "Critical" || rec.priority === "High";
    if (filter === "nice") return rec.priority === "Low";
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm font-medium text-text-main">
          {recommendations.length} things to fix — sorted by impact
        </p>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-primary text-white"
                  : "bg-card border border-border text-text-muted hover:border-primary/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((rec, i) => (
            <motion.div
              key={`${rec.title}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <FixCard rec={rec} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-sm text-text-muted">No recommendations match this filter.</p>
        </div>
      )}
    </div>
  );
}
