"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "@/lib/types";
import { CHECK_LABELS, PILLAR_FILTER_LABELS } from "@/lib/labels";
import Tooltip from "./Tooltip";
import ScoreRing from "./ScoreRing";

interface IssuesTabProps {
  checks: Check[];
}

const FILTER_OPTIONS = [
  "all",
  "Technical SEO",
  "On-Page SEO",
  "Links",
  "Performance",
  "AI Readiness",
];

function getCategoryGroup(category: string): string {
  if (["Structure", "Schema", "Entity", "Readability"].includes(category)) {
    return "AI Readiness";
  }
  return category;
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

function PriorityBadge({ impact }: { impact: string }) {
  const styles = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Low: "bg-blue-100 text-blue-700 border-blue-200",
  };
  const labels = { High: "Fix now", Medium: "Important", Low: "Nice to have" };
  const cls = styles[impact as keyof typeof styles] || styles.Low;
  const label = labels[impact as keyof typeof labels] || impact;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        impact === "High" ? "bg-red-500" : impact === "Medium" ? "bg-amber-500" : "bg-blue-500"
      }`} />
      {label}
    </span>
  );
}

export default function IssuesTab({ checks }: IssuesTabProps) {
  const [filter, setFilter] = useState("all");
  const [showPassed, setShowPassed] = useState(false);

  const passed = checks.filter((c) => c.passed);
  const failed = checks.filter((c) => !c.passed);
  const passedScore = Math.round((passed.length / checks.length) * 100);

  // Filter
  const filteredFailed = failed.filter((c) => {
    if (filter === "all") return true;
    if (filter === "AI Readiness") {
      return ["Structure", "Schema", "Entity", "Readability"].includes(c.category);
    }
    return c.category === filter;
  });

  const filteredPassed = passed.filter((c) => {
    if (filter === "all") return true;
    if (filter === "AI Readiness") {
      return ["Structure", "Schema", "Entity", "Readability"].includes(c.category);
    }
    return c.category === filter;
  });

  // Sort failed by impact
  const sortedFailed = [...filteredFailed].sort((a, b) => {
    const order: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    return (order[a.impact] ?? 3) - (order[b.impact] ?? 3);
  });

  return (
    <div className="space-y-4">
      {/* Top section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <ScoreRing score={passedScore} size={48} strokeWidth={4} />
          <span className="text-sm font-medium text-text-main">
            {passed.length} of {checks.length} checks passed
          </span>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? "bg-primary text-white"
                : "bg-card border border-border text-text-muted hover:border-primary/30"
            }`}
          >
            {f === "all" ? "All" : f === "AI Readiness" ? "AI Readiness" : getCategoryLabel(f)}
          </button>
        ))}
      </div>

      {/* Failed checks */}
      {sortedFailed.length > 0 ? (
        <div className="space-y-2">
          {sortedFailed.map((check, i) => {
            const label = CHECK_LABELS[check.id];
            return (
              <motion.div
                key={check.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                className={`bg-card border rounded-xl p-4 border-l-4 ${
                  check.impact === "High"
                    ? "border-l-red-500 border-red-200 bg-red-50/30"
                    : check.impact === "Medium"
                    ? "border-l-amber-400 border-amber-200 bg-amber-50/20"
                    : "border-l-blue-400 border-blue-200 bg-blue-50/20"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 flex-shrink-0 text-sm font-bold ${
                    check.impact === "High" ? "text-red-500" : check.impact === "Medium" ? "text-amber-500" : "text-blue-500"
                  }`}>✗</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main">
                      {label ? label.failed : check.text}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {getCategoryLabel(check.category)}
                      </span>
                      <PriorityBadge impact={check.impact} />
                    </div>
                    {label && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs text-text-dim">
                        <span className="mt-0.5">💡</span>
                        <span>Why it matters: {label.why}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-sm text-emerald-600 font-medium">
            No issues found in this category! 🎉
          </p>
        </div>
      )}

      {/* Passed checks */}
      {filteredPassed.length > 0 && (
        <div>
          <button
            onClick={() => setShowPassed(!showPassed)}
            className="text-xs text-primary font-medium hover:text-blue-600 transition-colors"
          >
            {showPassed
              ? `Hide ${filteredPassed.length} passed checks`
              : `Show ${filteredPassed.length} passed checks`}
          </button>
          <AnimatePresence>
          {showPassed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-1">
                {filteredPassed.map((check, i) => {
                  const label = CHECK_LABELS[check.id];
                  return (
                    <motion.div
                      key={check.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.2 }}
                      className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg hover:bg-emerald-50/50 transition-colors"
                    >
                      <span className="text-emerald-500 flex-shrink-0 font-bold">✓</span>
                      <span className="text-text-muted">
                        {label ? label.passed : check.text}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
