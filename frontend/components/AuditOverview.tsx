import { AnalyzeResponse, ModuleResult, Category } from "@/lib/types";
import Badge from "./Badge";

interface AuditOverviewProps {
  data: AnalyzeResponse;
}

interface ModuleConfig {
  title: string;
  category: Category;
  borderColor: string;
  result: ModuleResult;
}

function getScoreBadge(score: number) {
  if (score >= 75)
    return { text: `${score}/100`, variant: "medium" as const };
  if (score >= 50) return { text: `${score}/100`, variant: "high" as const };
  return { text: `${score}/100`, variant: "critical" as const };
}

function ModuleCard({ config }: { config: ModuleConfig }) {
  const badge = getScoreBadge(config.result.score);
  const failedChecks = config.result.checks.filter((c) => !c.passed);
  const passedChecks = config.result.checks.filter((c) => c.passed);

  return (
    <div
      className={`bg-card border border-border rounded-xl p-5 border-l-4 ${config.borderColor}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-main text-sm">{config.title}</h3>
        <Badge text={badge.text} variant={badge.variant} />
      </div>

      <div className="space-y-2">
        {failedChecks.slice(0, 3).map((check) => (
          <div key={check.id} className="flex items-start gap-2 text-sm">
            <span className="text-danger mt-0.5 flex-shrink-0">&#10005;</span>
            <span className="text-text-muted">{check.text}</span>
          </div>
        ))}
        {passedChecks.slice(0, 2).map((check) => (
          <div key={check.id} className="flex items-start gap-2 text-sm">
            <span className="text-emerald-600 mt-0.5 flex-shrink-0">&#10003;</span>
            <span className="text-text-muted">{check.text}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-text-muted">
          {passedChecks.length}/{config.result.checks.length} checks passed
        </p>
      </div>
    </div>
  );
}

export default function AuditOverview({ data }: AuditOverviewProps) {
  const seoModules: ModuleConfig[] = [
    {
      title: "Technical SEO",
      category: "Technical SEO",
      borderColor: "border-l-sky-500",
      result: data.technical_seo,
    },
    {
      title: "On-Page SEO",
      category: "On-Page SEO",
      borderColor: "border-l-indigo-500",
      result: data.onpage_seo,
    },
    {
      title: "Links",
      category: "Links",
      borderColor: "border-l-teal-500",
      result: data.link_analysis,
    },
    {
      title: "Performance",
      category: "Performance",
      borderColor: "border-l-orange-500",
      result: data.performance,
    },
  ];

  const geoModules: ModuleConfig[] = [
    {
      title: "Structure",
      category: "Structure",
      borderColor: "border-l-blue-500",
      result: data.geo_readiness.structure,
    },
    {
      title: "Schema Markup",
      category: "Schema",
      borderColor: "border-l-purple-500",
      result: data.geo_readiness.schema_markup,
    },
    {
      title: "Entity Coverage",
      category: "Entity",
      borderColor: "border-l-emerald-500",
      result: data.geo_readiness.entity,
    },
    {
      title: "Readability & Authority",
      category: "Readability",
      borderColor: "border-l-amber-500",
      result: data.geo_readiness.readability,
    },
  ];

  return (
    <div className="space-y-6">
      {/* SEO Section */}
      <div>
        <h2 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-3">
          SEO Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seoModules.map((mod) => (
            <ModuleCard key={mod.title} config={mod} />
          ))}
        </div>
      </div>

      {/* GEO Section */}
      <div>
        <h2 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-3">
          GEO Readiness (AI Engine Optimization)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {geoModules.map((mod) => (
            <ModuleCard key={mod.title} config={mod} />
          ))}
        </div>
      </div>
    </div>
  );
}
