"use client";

import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { AIRecommendation } from "@/lib/types";
import Badge from "./Badge";

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
  aiEnhanced: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for non-HTTPS contexts
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 text-xs text-text-dim hover:text-text-muted bg-surface rounded border border-border transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-accent" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          Copy
        </>
      )}
    </button>
  );
}

function isMarkdownTable(text: string): boolean {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return false;
  // Check if it has pipe-separated rows and a separator line like |---|---|
  return lines.some((l) => /^\|[\s-]+\|/.test(l.trim()) || /^[\s-|]+$/.test(l.trim()));
}

function parseMarkdownTable(text: string) {
  const lines = text.trim().split("\n").filter((l) => l.trim().length > 0);
  const rows: string[][] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip separator lines like |---|---|
    if (/^[\s|:-]+$/.test(trimmed) && trimmed.includes("-")) continue;
    // Parse pipe-separated cells
    if (trimmed.startsWith("|")) {
      const cells = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      if (cells.length > 0) rows.push(cells);
    }
  }
  return rows;
}

function MarkdownTable({ text }: { text: string }) {
  const rows = parseMarkdownTable(text);
  if (rows.length === 0) return <pre className="code-block text-text-muted whitespace-pre-wrap overflow-x-auto text-xs sm:text-sm">{text}</pre>;
  const header = rows[0];
  const body = rows.slice(1);
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b border-border">
          <tr>
            {header.map((cell, i) => (
              <th key={i} className="px-4 py-2.5 font-semibold text-text-main whitespace-nowrap">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 text-text-muted border-t border-border">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AIRecommendations({
  recommendations,
  aiEnhanced,
}: AIRecommendationsProps) {
  if (!aiEnhanced || recommendations.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-text-muted">
          AI-Powered Recommendations
        </h3>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-4 border-l-4 border-l-amber-500/50"
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h4 className="font-semibold text-text-main text-sm">
                {rec.title}
              </h4>
              <Badge text={rec.category} variant="neutral" />
              <Badge text="AI" variant="high" />
            </div>
            <p className="text-sm text-text-muted leading-relaxed mb-3">
              {rec.description}
            </p>

            {rec.suggested_rewrite && (
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-accent">
                    Suggested rewrite:
                  </span>
                  <CopyButton text={rec.suggested_rewrite} />
                </div>
                <p className="text-sm text-text-main leading-relaxed">
                  {rec.suggested_rewrite}
                </p>
              </div>
            )}

            {rec.code_snippet && (
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-text-dim">
                    {isMarkdownTable(rec.code_snippet) ? "Suggested table:" : "Code snippet:"}
                  </span>
                  <CopyButton text={rec.code_snippet} />
                </div>
                {isMarkdownTable(rec.code_snippet) ? (
                  <MarkdownTable text={rec.code_snippet} />
                ) : (
                  <pre className="code-block text-text-muted whitespace-pre-wrap break-all sm:break-normal overflow-x-auto text-xs sm:text-sm">
                    {rec.code_snippet}
                  </pre>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
