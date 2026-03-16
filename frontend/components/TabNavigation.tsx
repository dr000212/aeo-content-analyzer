"use client";

import { BarChart3, AlertTriangle, Wrench, Sparkles } from "lucide-react";

export type Tab = "overview" | "issues" | "fixes" | "ai";

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  issueCount?: number;
}

const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "issues", label: "Issues", icon: AlertTriangle },
  { id: "fixes", label: "How to Fix", icon: Wrench },
  { id: "ai", label: "AI Suggestions", icon: Sparkles },
];

export default function TabNavigation({
  activeTab,
  onTabChange,
  issueCount,
}: TabNavigationProps) {
  return (
    <div className="border-b border-border">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-dim hover:text-text-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === "issues" && issueCount !== undefined && issueCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium min-w-[20px] text-center">
                  {issueCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
