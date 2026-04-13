"use client";

import { useRef, useEffect, useState } from "react";
import { BarChart3, AlertTriangle, Wrench, Sparkles } from "lucide-react";

export type Tab = "overview" | "issues" | "fixes" | "ai";

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  issueCount?: number;
  hasAiRecommendations?: boolean;
}

const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "issues", label: "Issues", icon: AlertTriangle },
  { id: "fixes", label: "How to Fix", icon: Wrench },
  { id: "ai", label: "AI Insights", icon: Sparkles },
];

export default function TabNavigation({
  activeTab,
  onTabChange,
  issueCount,
  hasAiRecommendations,
}: TabNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeBtn) {
      setUnderline({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className="relative border-b border-border">
      <div ref={containerRef} className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap rounded-t-lg cursor-pointer ${
                isActive
                  ? "text-primary"
                  : "text-text-dim hover:text-text-main hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-primary" : ""}`} />
              <span>{tab.label}</span>
              {tab.id === "issues" && issueCount !== undefined && issueCount > 0 && (
                <span className="ml-0.5 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-bold min-w-[22px] text-center border border-red-200">
                  {issueCount}
                </span>
              )}
              {tab.id === "ai" && hasAiRecommendations && (
                <span className="ml-0.5 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-bold border border-purple-200">
                  ✨
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Animated underline */}
      <div
        className="absolute bottom-0 h-[3px] bg-primary rounded-full transition-all duration-300 ease-out"
        style={{ left: underline.left, width: underline.width }}
      />
    </div>
  );
}
