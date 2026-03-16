"use client";

import { useState } from "react";
import Header from "@/components/Header";
import URLInput from "@/components/URLInput";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ScoreHero from "@/components/ScoreHero";
import PillarScores from "@/components/PillarScores";
import PageSnapshot from "@/components/PageSnapshot";
import TabNavigation, { Tab } from "@/components/TabNavigation";
import OverviewTab from "@/components/OverviewTab";
import IssuesTab from "@/components/IssuesTab";
import FixesTab from "@/components/FixesTab";
import AIInsightsTab from "@/components/AIInsightsTab";
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
      setActiveTab("overview");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      if (msg.includes("timeout") || msg.includes("Timeout")) {
        setError("That page is taking too long to respond. It might be down or very slow.");
      } else if (msg.includes("DNS") || msg.includes("connection")) {
        setError("We couldn't open that page. Double-check the URL and make sure the page is publicly accessible.");
      } else if (msg.includes("rate") || msg.includes("429")) {
        setError("You've run a lot of analyses! Please wait a minute before trying again.");
      } else if (msg.includes("Non-HTML")) {
        setError("That URL doesn't point to a webpage. Make sure you're linking to an HTML page.");
      } else if (msg.includes("too large") || msg.includes("Content too large")) {
        setError("That page is really large! We can currently analyze pages up to 5MB.");
      } else if (msg.includes("500") || msg.includes("server")) {
        setError("Something went wrong on our end. Please try again.");
      } else {
        setError(msg);
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const issueCount = result
    ? result.checks.filter((c) => !c.passed).length
    : 0;

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

            {/* Score Hero */}
            <ScoreHero data={result} />

            {/* Pillar Scores */}
            <PillarScores data={result} />

            {/* Page Snapshot */}
            <PageSnapshot meta={result.meta} />

            {/* Tabs */}
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              issueCount={issueCount}
            />

            {/* Tab Content */}
            <div>
              {activeTab === "overview" && <OverviewTab data={result} />}
              {activeTab === "issues" && <IssuesTab checks={result.checks} />}
              {activeTab === "fixes" && (
                <FixesTab recommendations={result.recommendations} />
              )}
              {activeTab === "ai" && (
                <AIInsightsTab
                  recommendations={result.ai_recommendations}
                  aiEnhanced={result.ai_enhanced}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-6 mt-8 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-dim">
          <span>
            AEOLens &mdash; Find out how search engines and AI see your page
          </span>
          <span className="text-text-dim/60">
            Currently in beta &middot; Scores are indicative, not absolute
          </span>
        </div>
      </footer>
    </div>
  );
}
