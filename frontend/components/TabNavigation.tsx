"use client";

import { BarChart3, Lightbulb, CheckSquare } from "lucide-react";

export type Tab = "overview" | "recommendations" | "checklist";

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Audit Overview", icon: BarChart3 },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
  { id: "checklist", label: "Checklist", icon: CheckSquare },
];

export default function TabNavigation({
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.id
              ? "bg-card text-text-main border border-border-active shadow-sm"
              : "text-text-dim hover:text-text-muted border border-transparent"
          }`}
        >
          <tab.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
