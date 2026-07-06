"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Trash2 } from "lucide-react";

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
    <div className="px-8 pt-8 flex flex-col" style={{ height: "calc(100vh - 73px)" }}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-2xl font-semibold text-ink">Ask LOOP</div>
          <div className="text-sm text-[#6B6B80] mt-0.5 mb-4">Plain-English answers, grounded in real feedback</div>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setHistory([])}
            className="flex items-center gap-1.5 text-xs text-[#6B6B80] hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
          >
            <Trash2 size={13} /> Clear chat
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {history.length === 0 && (
          <div className="flex flex-col gap-2.5 mt-2">
            <div className="text-[#6B6B80] text-sm">Answers are grounded only in the feedback stored in this workspace.</div>
            <div className="text-xs font-semibold text-[#6B6B80] uppercase tracking-wide mt-1">Try asking</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)} className="px-3 py-2 rounded-full border border-[#E7E2D6] bg-white text-xs hover:bg-[#F5F2FC] hover:border-violet hover:text-violet transition-colors">{s}</button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 mt-4">
          {history.map((h, i) => (
            <div key={i} className={`flex ${h.role === "user" ? "justify-end" : "justify-start"}`}>
              {h.role === "user" ? (
                <div className="bg-violet text-white rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm max-w-[70%]">{h.text}</div>
              ) : (
                <div className="max-w-[78%]">
                  <div className="bg-white border border-[#E7E2D6] rounded-2xl rounded-bl-md px-4 py-3 text-sm whitespace-pre-wrap">{h.text}</div>
                  {h.cited && h.cited.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      <div className="text-[10px] font-bold text-[#6B6B80] uppercase">Grounded in {h.cited.length} feedback items</div>
                      {h.cited.map((c, idx) => (
                        <div key={c.id} className="text-xs text-[#6B6B80] bg-[#F5F2FC] rounded-lg px-2.5 py-1.5">[{idx + 1}] {c.content}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-[#6B6B80] text-sm">
              <Loader2 size={14} className="spin" /> Retrieving relevant feedback and drafting a grounded answer…
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2.5 py-4 border-t border-[#E7E2D6]">
        <input
          value={question} onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(question)}
          placeholder="Ask about your customer feedback…"
          className="flex-1 px-3.5 py-3 rounded-xl border border-[#E7E2D6] text-sm"
        />
        <button onClick={() => ask(question)} disabled={busy || !question.trim()}
          className="px-4 rounded-xl bg-violet text-white disabled:opacity-50 flex items-center">
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
