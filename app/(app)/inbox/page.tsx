"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Search, Plus, Upload, Radio, Loader2, X, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

const CHANNELS = ["Support Ticket", "App Store Review", "NPS Survey", "Sales Call Note", "Community Post"];

type Feedback = {
  id: string; content: string; channel: string; sentiment: "POS" | "NEU" | "NEG" | null;
  status: "NEW" | "REVIEWED" | "ACTIONED"; customerLabel: string | null;
  themes: { theme: { name: string } }[];
};

function SentimentDot({ s }: { s: Feedback["sentiment"] }) {
  const color = s === "POS" ? "#10B981" : s === "NEG" ? "#EF4444" : "#94A3B8";
  return <span className="inline-block w-2 h-2 rounded-full shadow-sm" style={{ background: color }} />;
}

function AddFeedbackModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [content, setContent] = useState("");
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!content.trim()) return;
    setBusy(true);
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim(), channel, customerLabel: label.trim() || undefined }),
    });
    setBusy(false);
    onAdded();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-white rounded-3xl p-7 w-full sm:w-[500px] max-w-full shadow-2xl animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex justify-between items-center mb-1 relative z-10">
          <div className="font-display text-xl font-bold text-ink">Add Feedback</div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"><X size={18} className="text-slate-500" /></button>
        </div>
        <div className="text-[13px] text-slate-muted mb-6 relative z-10">Claude classifies sentiment, theme, and feature area automatically on save.</div>

        <div className="relative z-10 space-y-5">
          <div>
            <label className="text-xs font-bold text-ink uppercase tracking-wider">Feedback content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4}
              placeholder="Paste or type the customer's feedback…"
              className="w-full mt-2 px-4 py-3 rounded-xl border border-slate-200/80 bg-white/50 text-[13px] resize-y focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all shadow-inner" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-ink uppercase tracking-wider">Channel</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value)}
                className="w-full mt-2 px-3 py-2.5 rounded-xl border border-slate-200/80 bg-white/50 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all shadow-sm">
                {CHANNELS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-ink uppercase tracking-wider">Customer / account</label>
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Optional"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/50 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all shadow-inner" />
            </div>
          </div>

          <button onClick={submit} disabled={busy || !content.trim()}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-[13px] flex items-center justify-center gap-2 hover:shadow-glow hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none">
            {busy ? <><Loader2 size={16} className="spin" /> Classifying with Claude…</> : <><Sparkles size={16} /> Save & classify</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "VIEWER";
  const canEdit = role !== "VIEWER";

  const [items, setItems] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [search, setSearch] = useState("");
  const [channelF, setChannelF] = useState("");
  const [sentimentF, setSentimentF] = useState("");
  const [statusF, setStatusF] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set("q", search);
    if (channelF) params.set("channel", channelF);
    if (sentimentF) params.set("sentiment", sentimentF);
    if (statusF) params.set("status", statusF);
    fetch(`/api/feedback?${params}`)
      .then((r) => r.json())
      .then((data) => { setItems(data.items ?? []); setTotal(data.total ?? 0); });
  }, [page, search, channelF, sentimentF, statusF]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: status as any } : it)));
    await fetch(`/api/feedback/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
  }

  async function simulateChannel() {
    setImporting(true);
    await fetch("/api/feedback/simulate-channel", { method: "POST" });
    setImporting(false);
    load();
  }

  async function simulateCsv() {
    setImporting(true);
    const csvText = [
      "content,channel,customer_label",
      '"Analyst seat pricing doesn\'t scale well past 20 users",NPS Survey,Ashgrove Retail',
      '"The theme drill-down is exactly the workflow our PM team wanted",Support Ticket,Tidewell Partners',
      '"Still waiting on a response to a billing ticket from four days ago",Support Ticket,Pinehall Studio',
    ].join("\n");
    await fetch("/api/feedback/import", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ csvText }),
    });
    setImporting(false);
    load();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const selectCls = "px-3 py-2 rounded-full border border-slate-200/60 bg-surface text-[13px] font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer hover:bg-slate-50 transition-colors";

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto animate-fade-in relative">
      <div className="absolute top-0 right-0 w-[600px] h-[300px] bg-accent-cyan/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search feedback content or customer..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200/60 bg-surface shadow-sm text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/40 transition-all" />
        </div>
        <select className={selectCls} value={channelF} onChange={(e) => { setChannelF(e.target.value); setPage(1); }}>
          <option value="">All channels</option>{CHANNELS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={selectCls} value={sentimentF} onChange={(e) => { setSentimentF(e.target.value); setPage(1); }}>
          <option value="">All sentiment</option><option value="POS">Positive</option><option value="NEU">Neutral</option><option value="NEG">Negative</option>
        </select>
        <select className={selectCls} value={statusF} onChange={(e) => { setStatusF(e.target.value); setPage(1); }}>
          <option value="">All status</option><option>NEW</option><option>REVIEWED</option><option>ACTIONED</option>
        </select>

        {canEdit && (
          <div className="flex gap-2 ml-auto">
            <button onClick={simulateCsv} disabled={importing} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200/60 bg-surface hover:bg-slate-50 text-[13px] font-semibold text-slate-700 shadow-sm transition-colors">
              {importing ? <Loader2 size={14} className="spin" /> : <Upload size={14} />} Import CSV
            </button>
            <button onClick={simulateChannel} disabled={importing} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200/60 bg-surface hover:bg-slate-50 text-[13px] font-semibold text-slate-700 shadow-sm transition-colors">
              {importing ? <Loader2 size={14} className="spin" /> : <Radio size={14} />} Pull channel
            </button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white text-[13px] font-semibold shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition-all">
              <Plus size={14} /> Add feedback
            </button>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-2xl overflow-x-auto shadow-soft border border-white/60 relative z-10 animate-slide-up">
        <div className="grid grid-cols-[1.5fr_140px_110px_200px_140px_120px] min-w-[900px] px-6 py-4 text-[11px] font-bold text-slate-muted uppercase tracking-wider border-b border-slate-200/50 bg-white/40 backdrop-blur-sm">
          <div>Feedback</div><div>Channel</div><div>Sentiment</div><div>Themes</div><div>Account</div><div>Status</div>
        </div>
        {items.length === 0 && <div className="py-16 text-center text-[13px] text-slate-muted font-medium bg-white/30">No feedback matches these filters.</div>}
        <div className="divide-y divide-slate-100/50 bg-white/30">
          {items.map((it) => (
            <div key={it.id} className="grid grid-cols-[1.5fr_140px_110px_200px_140px_120px] min-w-[900px] px-6 py-4 items-center text-[13px] hover:bg-primary-50/30 transition-colors group">
              <div className="pr-4 text-ink font-medium leading-relaxed">{it.content}</div>
              <div className="text-slate-500">{it.channel}</div>
              <div className="flex items-center gap-2"><SentimentDot s={it.sentiment} /> {it.sentiment ?? "—"}</div>
              <div className="flex flex-wrap gap-1.5">
                {it.themes.slice(0, 2).map((ft) => (
                  <span key={ft.theme.name} className="bg-primary-50 border border-primary-100 text-primary-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">{ft.theme.name}</span>
                ))}
              </div>
              <div className="text-slate-500 font-medium">{it.customerLabel ?? "—"}</div>
              <div>
                {canEdit ? (
                  <select value={it.status} onChange={(e) => updateStatus(it.id, e.target.value)} className="text-[11px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/40 outline-none cursor-pointer hover:border-slate-300 transition-colors">
                    <option>NEW</option><option>REVIEWED</option><option>ACTIONED</option>
                  </select>
                ) : (
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    it.status === 'NEW' ? 'bg-accent-amber/10 text-accent-amber' : 
                    it.status === 'REVIEWED' ? 'bg-primary-50 text-primary-600' : 'bg-accent-emerald/10 text-accent-emerald'
                  }`}>{it.status}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 px-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="text-[13px] font-medium text-slate-muted">Showing page {page} of {totalPages} <span className="mx-2 text-slate-300">•</span> {total} total items</div>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-full border border-slate-200/60 bg-surface shadow-sm hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-surface disabled:hover:border-slate-200/60 transition-all">
            <ChevronLeft size={16} className="text-slate-600" />
          </button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-full border border-slate-200/60 bg-surface shadow-sm hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-surface disabled:hover:border-slate-200/60 transition-all">
            <ChevronRight size={16} className="text-slate-600" />
          </button>
        </div>
      </div>

      {showAdd && <AddFeedbackModal onClose={() => setShowAdd(false)} onAdded={load} />}
    </div>
  );
}
