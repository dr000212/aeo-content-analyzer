"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Logo from "@/components/Logo";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ScoreDashboard from "@/components/ScoreDashboard";
import PillarScores from "@/components/PillarScores";
import PageSnapshot from "@/components/PageSnapshot";
import TabNavigation, { Tab } from "@/components/TabNavigation";
import OverviewTab from "@/components/OverviewTab";
import IssuesTab from "@/components/IssuesTab";
import FixesTab from "@/components/FixesTab";
import AIInsightsTab from "@/components/AIInsightsTab";
import ChatInterface from "@/components/ChatInterface";
import { AnalyzeResponse } from "@/lib/types";
import { analyzeURL } from "@/lib/api";

export default function Home() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [viewMode, setViewMode] = useState<"chat" | "detailed">("chat");

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

      <main className="max-w-6xl mx-auto px-4 py-8 overflow-x-hidden">
        {/* States */}
        {loading && <LoadingState />}

        {!loading && !result && (
          <EmptyState
            onAnalyze={handleAnalyze}
            isLoading={loading}
            error={error}
            onDismissError={() => setError("")}
          />
        )}

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

            {/* Interactive Score Dashboard */}
            <ScoreDashboard data={result} />

            {/* Chat / Detailed Toggle */}
            <div className="flex items-center justify-center gap-1 p-1 bg-white border border-border rounded-xl shadow-sm">
              <button
                onClick={() => setViewMode("chat")}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
                  viewMode === "chat"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-muted hover:text-text-main hover:bg-slate-50"
                }`}
              >
                💬 Chat with AI Expert
              </button>
              <button
                onClick={() => setViewMode("detailed")}
                className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
                  viewMode === "detailed"
                    ? "bg-primary text-white shadow-md"
                    : "text-text-muted hover:text-text-main hover:bg-slate-50"
                }`}
              >
                📊 Detailed Breakdown
              </button>
            </div>

            {/* Chat View */}
            {viewMode === "chat" && (
              <ChatInterface
                analysisId={result.analysis_id}
                initialSuggestions={result.suggested_questions}
                url={result.url}
              />
            )}

            {/* Detailed View */}
            {viewMode === "detailed" && (
              <div className="space-y-4">
                <PillarScores data={result} />
                <PageSnapshot meta={result.meta} />
                <TabNavigation
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  issueCount={issueCount}
                  hasAiRecommendations={result.ai_enhanced && result.ai_recommendations.length > 0}
                />
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-6 mt-8 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-dim">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center inline-flex">
              <Logo size={10} />
            </span>
            SearchEO &mdash; Find out how search engines and AI see your page
          </span>
          <span className="text-text-dim/60">
            Currently in beta &middot; Scores are indicative, not absolute
          </span>
        </div>
      </footer>
    </div>
  );
}
