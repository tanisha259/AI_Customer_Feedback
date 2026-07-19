"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Trash2, MessageSquareText, Sparkles } from "lucide-react";

type Cited = { id: string; content: string; channel: string; sentiment: string | null };
type Turn = { role: "user" | "assistant"; text: string; cited?: Cited[] };

const SUGGESTIONS = [
  "What are users saying about onboarding?",
  "Is anyone unhappy with pricing?",
  "What SSO issues have come up recently?",
  "Are there complaints about the mobile app?",
];

export default function AskLoopPage() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, busy]);

  async function ask(q: string) {
    if (!q.trim() || busy) return;
    setQuestion("");
    setBusy(true);
    setHistory((h) => [...h, { role: "user", text: q }]);

    const res = await fetch("/api/insights", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }),
    });
    const data = await res.json();

    if (!res.ok) {
      setHistory((h) => [...h, { role: "assistant", text: data.error ?? "Something went wrong." }]);
    } else {
      setHistory((h) => [...h, { role: "assistant", text: data.answer, cited: data.cited }]);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col relative bg-paper animate-fade-in" style={{ height: "calc(100vh - 73px)" }}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-primary-300/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-accent-cyan/10 rounded-full blur-[100px]" />
      </div>

      <div className="px-8 pt-8 pb-4 flex items-center justify-between z-10 sticky top-0 bg-paper/80 backdrop-blur-xl border-b border-white/50">
        <div>
          <div className="font-display text-3xl font-bold text-ink flex items-center gap-2">
            <Sparkles className="text-primary-500" size={24} /> Ask LOOP
          </div>
          <div className="text-[14px] text-slate-muted mt-1 font-medium">Plain-English answers, grounded in real feedback</div>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setHistory([])}
            className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 hover:text-accent-rose transition-colors px-4 py-2 rounded-full hover:bg-accent-rose/10 border border-transparent hover:border-accent-rose/20 uppercase tracking-wider"
          >
            <Trash2 size={14} /> Clear chat
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-32 z-10 relative">
        <div className="max-w-4xl mx-auto w-full">
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-32 animate-slide-up">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-6 shadow-glow border border-primary-200">
                <MessageSquareText size={32} className="text-primary-600" />
              </div>
              <h2 className="text-2xl font-display font-semibold text-ink mb-2">How can I help you today?</h2>
              <div className="text-slate-500 text-[15px] mb-10 max-w-lg text-center leading-relaxed">
                I can analyze themes, summarize sentiment, and answer specific questions grounded entirely in your workspace's feedback.
              </div>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="p-4 text-left rounded-2xl glass-panel border-white/60 hover:shadow-float hover:-translate-y-0.5 hover:border-primary-200 transition-all group">
                    <div className="text-[13px] text-ink font-medium leading-snug group-hover:text-primary-700 transition-colors">{s}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6 mt-6">
            {history.map((h, i) => (
              <div key={i} className={`flex ${h.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`} style={{ animationDelay: '0.05s' }}>
                {h.role === "user" ? (
                  <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-glow border border-primary-500/50 rounded-[24px] rounded-br-sm px-5 py-3 text-[14px] max-w-[70%] font-medium leading-relaxed">
                    {h.text}
                  </div>
                ) : (
                  <div className="max-w-[85%] flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex-shrink-0 flex items-center justify-center text-white shadow-soft mt-1">
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <div className="glass-panel border-white/60 rounded-[24px] rounded-tl-sm px-6 py-4 text-[14px] text-ink whitespace-pre-wrap leading-relaxed shadow-sm">
                        {h.text}
                      </div>
                      {h.cited && h.cited.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2 ml-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-primary-500" />
                            Grounded in {h.cited.length} sources
                          </div>
                          <div className="flex flex-col gap-2">
                            {h.cited.map((c, idx) => (
                              <div key={c.id} className="text-[12px] text-slate-600 bg-white/40 border border-slate-200/50 backdrop-blur-sm rounded-xl px-4 py-2 hover:bg-white/60 transition-colors">
                                <span className="font-mono text-primary-500 font-bold mr-1.5">[{idx + 1}]</span> 
                                {c.content}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-[85%] flex gap-4 items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex-shrink-0 flex items-center justify-center text-white shadow-soft">
                    <Loader2 size={14} className="spin" />
                  </div>
                  <div className="text-primary-600 text-[13px] font-medium tracking-wide">
                    Analyzing feedback and drafting answer...
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 pt-12 bg-gradient-to-t from-paper via-paper/90 to-transparent z-20">
        <div className="max-w-4xl mx-auto relative group">
          <input
            value={question} onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(question)}
            placeholder="Ask about your customer feedback…"
            className="w-full pl-6 pr-14 py-4 rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-float text-[14px] text-ink focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all placeholder:text-slate-400 font-medium"
          />
          <button onClick={() => ask(question)} disabled={busy || !question.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-500 text-white disabled:opacity-50 flex items-center justify-center hover:shadow-glow hover:scale-105 transition-all disabled:hover:scale-100 disabled:hover:shadow-none">
            <Send size={16} className={question.trim() ? "translate-x-[1px]" : ""} />
          </button>
        </div>
        <div className="text-center mt-3 text-[11px] text-slate-400 font-medium">LOOP AI can make mistakes. Verify important information.</div>
      </div>
    </div>
  );
}
