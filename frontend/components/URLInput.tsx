"use client";

import { useState } from "react";
import { Globe, Loader2, ArrowRight, Sparkles } from "lucide-react";

interface URLInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export default function URLInput({ onAnalyze, isLoading }: URLInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  function validate(value: string): boolean {
    if (!value.trim()) {
      setError("Please enter a URL.");
      return false;
    }
    if (!/^https?:\/\/.+/i.test(value.trim())) {
      setError("Please enter a valid URL starting with http:// or https://");
      return false;
    }
    setError("");
    return true;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate(url)) {
      onAnalyze(url.trim());
    }
  }

  return (
    <div id="url-input" className="w-full">
      {/* Outer wrapper with glow effect */}
      <div
        className={`relative rounded-2xl p-[1px] transition-all duration-300 ${
          focused
            ? "bg-gradient-to-r from-primary via-blue-400 to-primary shadow-lg shadow-primary/15"
            : "bg-border"
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row sm:items-center gap-2 bg-surface rounded-2xl px-3 sm:px-4 py-2.5 sm:py-2"
        >
          {/* Input row */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                focused ? "bg-primary/10" : "bg-bg"
              }`}
            >
              <Globe
                className={`w-4 h-4 transition-colors duration-300 ${
                  focused ? "text-primary" : "text-text-dim"
                }`}
              />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Paste any URL to analyze..."
              className="flex-1 min-w-0 py-2 sm:py-2.5 bg-transparent text-text-main placeholder:text-text-dim focus:outline-none text-sm"
              disabled={isLoading}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-shrink-0 w-full sm:w-auto px-5 py-2.5 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm whitespace-nowrap transition-all duration-200 ${
              isLoading
                ? "bg-primary/70 cursor-not-allowed"
                : "bg-primary hover:bg-blue-600 hover:shadow-md hover:shadow-primary/20 active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-danger pl-2">{error}</p>
      )}

      {/* Helper text */}
      {!error && !isLoading && (
        <p className="mt-2 text-xs text-text-dim pl-2">
          Works with any public webpage &mdash; blogs, landing pages, docs, articles
        </p>
      )}
    </div>
  );
}
