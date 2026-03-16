"use client";

import { ArrowRight, Search } from "lucide-react";

const categories = [
  { icon: "🏗️", name: "Site Foundation", desc: "Is your website built right?" },
  { icon: "📝", name: "Content", desc: "Is your content set up for search?" },
  { icon: "🔗", name: "Links", desc: "Are your links helping or hurting?" },
  { icon: "⚡", name: "Speed", desc: "How fast does your page load?" },
  { icon: "🤖", name: "AI Readiness", desc: "Can AI assistants cite your content?" },
];

export default function EmptyState() {
  return (
    <div className="space-y-10 py-8">
      {/* Hero */}
      <div className="flex flex-col items-center text-center px-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-10 blur-md animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 flex items-center justify-center">
            <Search className="w-9 h-9 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-main mb-2 tracking-tight">
          Find out how search engines and AI see your page
        </h2>
        <p className="text-text-muted max-w-2xl mt-1">
          Paste any webpage URL above and we'll check 66 things across 5 categories
          to help you get found online.
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="bg-card border border-border rounded-xl p-4 flex items-start gap-3"
          >
            <span className="text-2xl flex-shrink-0">{cat.icon}</span>
            <div>
              <h3 className="font-semibold text-text-main text-sm">{cat.name}</h3>
              <p className="text-xs text-text-muted mt-0.5">{cat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center text-center pt-2">
        <p className="text-sm text-text-dim mb-1">Free · No signup required · Results in seconds</p>
        <button
          onClick={() => {
            const input = document.querySelector<HTMLInputElement>("#url-input input");
            if (input) {
              input.scrollIntoView({ behavior: "smooth", block: "center" });
              setTimeout(() => input.focus(), 400);
            }
          }}
          className="flex items-center gap-2 text-primary font-medium hover:text-blue-600 transition-colors cursor-pointer mt-2"
        >
          <ArrowRight className="w-4 h-4" />
          Enter a URL above to get started
        </button>
      </div>
    </div>
  );
}
