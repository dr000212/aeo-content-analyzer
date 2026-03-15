import { AnalyzeResponse, Category } from "@/lib/types";
import Badge from "./Badge";

interface AuditOverviewProps {
  data: AnalyzeResponse;
}

const moduleConfig: {
  key: "structure" | "schema_markup" | "entity" | "readability";
  title: string;
  category: Category;
  borderColor: string;
}[] = [
  {
    key: "structure",
    title: "Structure Analysis",
    category: "Structure",
    borderColor: "border-l-blue-500",
  },
  {
    key: "schema_markup",
    title: "Schema Markup",
    category: "Schema",
    borderColor: "border-l-purple-500",
  },
  {
    key: "entity",
    title: "Entity Coverage",
    category: "Entity",
    borderColor: "border-l-emerald-500",
  },
  {
    key: "readability",
    title: "Readability & Authority",
    category: "Readability",
    borderColor: "border-l-amber-500",
  },
];

function getScoreBadge(score: number) {
  if (score >= 75)
    return { text: `${score}/100`, variant: "medium" as const };
  if (score >= 50) return { text: `${score}/100`, variant: "high" as const };
  return { text: `${score}/100`, variant: "critical" as const };
}

export default function AuditOverview({ data }: AuditOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {moduleConfig.map((mod) => {
        const result = data[mod.key];
        const badge = getScoreBadge(result.score);
        const failedChecks = result.checks.filter((c) => !c.passed);
        const passedChecks = result.checks.filter((c) => c.passed);

        return (
          <div
            key={mod.key}
            className={`bg-card border border-border rounded-xl p-5 border-l-4 ${mod.borderColor}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-main">{mod.title}</h3>
              <Badge text={badge.text} variant={badge.variant} />
            </div>

            <div className="space-y-2">
              {failedChecks.slice(0, 3).map((check) => (
                <div
                  key={check.id}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-danger mt-0.5 flex-shrink-0">
                    &#10005;
                  </span>
                  <span className="text-text-muted">{check.text}</span>
                </div>
              ))}
              {passedChecks.slice(0, 2).map((check) => (
                <div
                  key={check.id}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-emerald-600 mt-0.5 flex-shrink-0">
                    &#10003;
                  </span>
                  <span className="text-text-muted">{check.text}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-text-muted">
                {passedChecks.length}/{result.checks.length} checks passed
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
