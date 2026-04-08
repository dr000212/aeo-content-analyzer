"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot } from "lucide-react";
import ChatMessage from "./ChatMessage";
import SuggestedQuestions from "./SuggestedQuestions";
import { sendChatMessage } from "@/lib/api";
import { ChatHistoryItem } from "@/lib/types";

interface ChatInterfaceProps {
  analysisId: string | null;
  initialSuggestions: string[];
  url: string;
}

export default function ChatInterface({
  analysisId,
  initialSuggestions,
  url,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatHistoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset chat when analysis changes
  useEffect(() => {
    setMessages([]);
    setSuggestions(initialSuggestions);
    setError("");
  }, [analysisId, initialSuggestions]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async (text: string) => {
    if (!text.trim() || !analysisId || sending) return;

    setError("");
    const userMsg: ChatHistoryItem = { role: "user", content: text.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setSending(true);

    try {
      const response = await sendChatMessage(analysisId, text.trim(), messages);
      setMessages([
        ...newHistory,
        { role: "assistant", content: response.content },
      ]);
      if (response.suggested_questions.length > 0) {
        setSuggestions(response.suggested_questions);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      // Roll back the user message so they can retry
      setMessages(messages);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  if (!analysisId) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-center text-text-muted text-sm">
        Chat is unavailable for this analysis. Try analyzing the page again.
      </div>
    );
  }

  return (
    <div id="seo-chat" className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border-2 border-primary/30 rounded-2xl overflow-hidden shadow-xl scroll-mt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-purple-600 to-accent p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              Expert SEO Assistant
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                Powered by AI
              </span>
            </h3>
            <p className="text-xs text-white/80">
              Ask me anything about your SearchEO analysis
            </p>
          </div>
        </div>
      </div>

      {/* Welcome message (shown when no messages yet) */}
      {messages.length === 0 && (
        <div className="p-5 border-b border-border/50">
          <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent to-emerald-500 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-text-main shadow-sm max-w-[85%]">
              <p className="mb-1">
                Hi! I&apos;ve reviewed your analysis of{" "}
                <span className="font-semibold text-primary break-all">{url}</span>.
              </p>
              <p className="text-text-muted">
                I can explain your score, walk you through any issue, and give you
                step-by-step instructions to fix it. Try one of the questions below
                or type your own.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-[500px] overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {sending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-emerald-500 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggested questions */}
      {suggestions.length > 0 && !sending && (
        <div className="px-5 py-3 border-t border-border/50">
          <p className="text-[11px] font-semibold text-text-dim uppercase tracking-wider mb-2">
            {messages.length === 0 ? "Try asking" : "Suggested questions"}
          </p>
          <SuggestedQuestions
            questions={suggestions}
            onSelect={handleSend}
            disabled={sending}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-5 py-2 bg-danger/10 border-t border-danger/20 text-xs text-danger flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-white/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder="Ask about your SEO results..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-white text-sm text-text-main placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-medium text-sm flex items-center gap-1.5 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
