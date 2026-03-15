import { Recommendation } from "@/lib/types";
import Badge, { priorityToVariant } from "./Badge";

interface RecommendationListProps {
  recommendations: Recommendation[];
}

export default function RecommendationList({
  recommendations,
}: RecommendationListProps) {
  if (recommendations.length === 0) return null;

  const borderColors: Record<string, string> = {
    Critical: "border-l-red-500",
    High: "border-l-amber-500",
    Medium: "border-l-green-500",
    Low: "border-l-slate-500",
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-text-muted mb-3">
        {recommendations.length} actionable recommendation
        {recommendations.length !== 1 ? "s" : ""}
      </h3>
      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className={`bg-card border border-border rounded-xl p-4 border-l-4 ${
              borderColors[rec.priority] || "border-l-slate-500"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h4 className="font-semibold text-text-main text-sm">
                {rec.title}
              </h4>
              <Badge
                text={rec.priority}
                variant={priorityToVariant(rec.priority)}
              />
              <Badge text={rec.category} variant="neutral" />
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              {rec.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
