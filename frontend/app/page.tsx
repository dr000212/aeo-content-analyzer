"use client";

import { useState } from "react";
import { Clock, Database } from "lucide-react";
import Header from "@/components/Header";
import URLInput from "@/components/URLInput";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ScoreOverview from "@/components/ScoreOverview";
import PageMeta from "@/components/PageMeta";
import TabNavigation, { Tab } from "@/components/TabNavigation";
import AuditOverview from "@/components/AuditOverview";
import RecommendationList from "@/components/RecommendationList";
import AIRecommendations from "@/components/AIRecommendations";
import ChecklistView from "@/components/ChecklistView";
import { AnalyzeResponse } from "@/lib/types";
import { analyzeURL } from "@/lib/api";

export default function Home() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  async function handleAnalyze(url: string) {
    setLoading(true);
    setError("");
    try {
      const data = await analyzeURL(url);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* URL Input */}
        <div className="mb-8">
          <URLInput onAnalyze={handleAnalyze} isLoading={loading} />
          {error && (
            <div className="mt-3 p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-center justify-between">
              <p className="text-sm text-danger">{error}</p>
              <button
                onClick={() => setError("")}
                className="text-danger hover:text-red-300 text-sm ml-4"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* States */}
        {loading && <LoadingState />}

        {!loading && !result && !error && <EmptyState />}

        {!loading && result && (
          <div className="space-y-6">
            {/* Analyzed URL */}
            <div className="flex items-center gap-2 text-sm text-text-dim">
              <span className="truncate">Results for: {result.url}</span>
              {result.meta.title && (
                <span className="hidden md:inline text-text-muted truncate">
                  &mdash; {result.meta.title}
                </span>
              )}
            </div>

            {/* Score Overview */}
            <ScoreOverview data={result} />

            {/* Page Meta */}
            <PageMeta meta={result.meta} />

            {/* Tabs */}
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <div>
              {activeTab === "overview" && <AuditOverview data={result} />}

              {activeTab === "recommendations" && (
                <div>
                  <RecommendationList
                    recommendations={result.recommendations}
                  />
                  <AIRecommendations
                    recommendations={result.ai_recommendations}
                    aiEnhanced={result.ai_enhanced}
                  />
                </div>
              )}

              {activeTab === "checklist" && (
                <ChecklistView checks={result.checks} />
              )}
            </div>

            {/* Footer stats */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border text-xs text-text-dim">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Analyzed in {result.analysis_time_ms}ms
              </div>
              {result.cached && (
                <div className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  <span className="px-1.5 py-0.5 bg-accent/10 text-accent rounded text-xs">
                    Cached result
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-6 mt-8 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-dim">
          <span>
            AEOLens &mdash; AI Answer Engine Content Optimizer
          </span>
          <span className="text-text-dim/60">
            Currently in beta &middot; Scores are indicative, not absolute
          </span>
        </div>
      </footer>
    </div>
  );
}
