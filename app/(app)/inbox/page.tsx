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
  const color = s === "POS" ? "#4F9A73" : s === "NEG" ? "#D9534F" : "#8A8AA0";
  return <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />;
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
    <div className="fixed inset-0 bg-ink/45 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[460px]">
        <div className="flex justify-between items-center mb-1">
          <div className="font-display text-lg font-semibold">Add feedback</div>
          <button onClick={onClose}><X size={18} className="text-[#6B6B80]" /></button>
        </div>
        <div className="text-xs text-[#6B6B80] mb-4">Claude classifies sentiment, theme, and feature area automatically on save.</div>

        <label className="text-xs font-semibold text-ink">Feedback content</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4}
          placeholder="Paste or type the customer's feedback…"
          className="w-full mt-1.5 mb-3.5 px-3 py-2.5 rounded-lg border border-[#E7E2D6] text-sm resize-y" />

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-xs font-semibold text-ink">Channel</label>
            <select value={channel} onChange={(e) => setChannel(e.target.value)}
              className="w-full mt-1.5 px-2.5 py-2 rounded-lg border border-[#E7E2D6] text-sm">
              {CHANNELS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-ink">Customer / account</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Optional"
              className="w-full mt-1.5 px-2.5 py-2 rounded-lg border border-[#E7E2D6] text-sm" />
          </div>
        </div>

        <button onClick={submit} disabled={busy || !content.trim()}
          className="w-full py-2.5 rounded-lg bg-violet text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {busy ? <><Loader2 size={15} className="spin" /> Classifying with Claude…</> : <><Sparkles size={15} /> Save & classify</>}
        </button>
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
  const selectCls = "px-2.5 py-1.5 rounded-lg border border-[#E7E2D6] text-xs bg-white";

  return (
    <div className="p-8">
      <div className="flex gap-2.5 mb-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-2.5 top-2.5 text-[#6B6B80]" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search feedback…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#E7E2D6] text-sm" />
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
            <button onClick={simulateCsv} disabled={importing} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E7E2D6] bg-white text-xs font-semibold">
              {importing ? <Loader2 size={13} className="spin" /> : <Upload size={13} />} Import CSV
            </button>
            <button onClick={simulateChannel} disabled={importing} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E7E2D6] bg-white text-xs font-semibold">
              {importing ? <Loader2 size={13} className="spin" /> : <Radio size={13} />} Pull channel
            </button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet text-white text-xs font-semibold">
              <Plus size={13} /> Add feedback
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#E7E2D6] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_130px_100px_200px_130px_120px] px-4 py-2.5 text-[11px] font-bold text-[#6B6B80] uppercase tracking-wide border-b border-[#E7E2D6]">
          <div>Feedback</div><div>Channel</div><div>Sentiment</div><div>Themes</div><div>Account</div><div>Status</div>
        </div>
        {items.length === 0 && <div className="py-10 text-center text-sm text-[#6B6B80]">No feedback matches these filters yet.</div>}
        {items.map((it) => (
          <div key={it.id} className="grid grid-cols-[1fr_130px_100px_200px_130px_120px] px-4 py-3 border-b border-[#E7E2D6] items-center text-[12.8px]">
            <div className="pr-3 text-ink">{it.content}</div>
            <div className="text-[#6B6B80]">{it.channel}</div>
            <div className="flex items-center gap-1.5"><SentimentDot s={it.sentiment} /> {it.sentiment ?? "—"}</div>
            <div className="flex flex-wrap gap-1">
              {it.themes.slice(0, 2).map((ft) => (
                <span key={ft.theme.name} className="bg-[#EFEAFB] text-violetDeep text-[11px] font-semibold px-2 py-0.5 rounded-full">{ft.theme.name}</span>
              ))}
            </div>
            <div className="text-[#6B6B80] text-xs">{it.customerLabel ?? "—"}</div>
            <div>
              {canEdit ? (
                <select value={it.status} onChange={(e) => updateStatus(it.id, e.target.value)} className="text-[11px] px-1.5 py-1 rounded border border-[#E7E2D6]">
                  <option>NEW</option><option>REVIEWED</option><option>ACTIONED</option>
                </select>
              ) : (
                <span className="text-[11px] font-semibold text-[#6B6B80]">{it.status}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-3.5">
        <div className="text-xs text-[#6B6B80]">{total} items · page {page} of {totalPages}</div>
        <div className="flex gap-1.5">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-[#E7E2D6] bg-white disabled:opacity-40">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-[#E7E2D6] bg-white disabled:opacity-40">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {showAdd && <AddFeedbackModal onClose={() => setShowAdd(false)} onAdded={load} />}
    </div>
  );
}
