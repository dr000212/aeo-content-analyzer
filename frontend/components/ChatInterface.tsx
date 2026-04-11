"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, MessageCircle, Zap } from "lucide-react";
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

  useEffect(() => {
    setMessages([]);
    setSuggestions(initialSuggestions);
    setError("");
  }, [analysisId, initialSuggestions]);

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
    <div id="seo-chat" className="bg-gradient-to-b from-white to-slate-50 border-2 border-border rounded-2xl overflow-hidden shadow-xl scroll-mt-20">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary via-indigo-600 to-purple-600 p-5 text-white overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-8 w-20 h-20 rounded-full bg-white/20 blur-xl" />
          <div className="absolute bottom-0 left-12 w-16 h-16 rounded-full bg-white/15 blur-lg" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg flex items-center gap-2">
              SEO Expert Assistant
              <span className="text-[10px] bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                <Zap className="w-3 h-3" />
                AI Powered
              </span>
            </h3>
            <p className="text-sm text-white/70 mt-0.5">
              Get personalized advice for your SearchEO results
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/80">Online</span>
          </div>
        </div>
      </div>

      {/* Welcome message */}
      {messages.length === 0 && (
        <div className="p-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="bg-white border border-border/80 rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
                <p className="text-sm text-text-main leading-relaxed">
                  👋 Hi! I&apos;ve just finished analyzing{" "}
                  <span className="font-semibold text-primary break-all">{url}</span>
                </p>
                <p className="text-sm text-text-muted mt-2 leading-relaxed">
                  Ask me anything — I can explain your score, walk you through specific issues,
                  or give step-by-step fix instructions.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2 ml-1">
                <MessageCircle className="w-3 h-3 text-text-dim" />
                <span className="text-[11px] text-text-dim">Just now</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-[520px] overflow-y-auto p-6 space-y-5">
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {sending && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-border rounded-2xl rounded-tl-md px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs text-text-dim ml-1">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggested questions */}
      {suggestions.length > 0 && !sending && (
        <div className="px-6 py-4 border-t border-border/40 bg-gradient-to-b from-slate-50/80 to-white">
          <p className="text-[11px] font-bold text-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary/50" />
            {messages.length === 0 ? "Try asking" : "Follow-up questions"}
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
        <div className="px-6 py-3 bg-red-50 border-t border-red-100 text-xs text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border/40 bg-white">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              placeholder="Ask about your SEO results..."
              className="w-full px-5 py-3 rounded-xl border-2 border-border/80 bg-slate-50 text-sm text-text-main placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-white disabled:opacity-50 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
