import { Check as CheckType } from "@/lib/types";
import Badge, { priorityToVariant } from "./Badge";

interface ChecklistViewProps {
  checks: CheckType[];
}

export default function ChecklistView({ checks }: ChecklistViewProps) {
  const passed = checks.filter((c) => c.passed).length;
  const total = checks.length;
  const pct = total > 0 ? (passed / total) * 100 : 0;

  // Sort: failed first, then passed
  const sorted = [...checks].sort((a, b) => {
    if (a.passed === b.passed) return 0;
    return a.passed ? 1 : -1;
  });

  return (
    <div>
      {/* Progress bar */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-main">
            {passed}/{total} checks passed
          </span>
          <span className="text-sm text-text-dim">{Math.round(pct)}%</span>
        </div>
        <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {sorted.map((check) => (
          <div
            key={check.id}
            className={`p-3 rounded-lg border transition-colors ${
              check.passed
                ? "bg-card border-border"
                : "bg-danger/5 border-danger/20"
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`mt-0.5 flex-shrink-0 text-sm font-bold ${
                  check.passed ? "text-emerald-600" : "text-danger"
                }`}
              >
                {check.passed ? "\u2713" : "\u2717"}
              </span>
              <p
                className={`text-sm flex-1 min-w-0 ${
                  check.passed ? "text-text-muted" : "text-text-main"
                }`}
              >
                {check.text}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2 pl-5">
              <Badge
                text={check.impact}
                variant={priorityToVariant(check.impact)}
              />
              <Badge text={check.category} variant="neutral" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
