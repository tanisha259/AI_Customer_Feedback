"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Minus, X, Activity } from "lucide-react";

const THEME_COLOR: Record<string, string> = {
  "Onboarding": "#6366F1", "Billing & Invoicing": "#F59E0B", "Mobile Experience": "#10B981",
  "Performance & Speed": "#EF4444", "Integrations & SSO": "#06B6D4", "Reporting & Exports": "#8B5CF6",
  "Customer Support": "#EC4899", "Pricing": "#D97706", "UI / UX Design": "#3B82F6",
  "Feature Requests": "#84CC16",
};

type ThemeRow = { id: string; name: string; total: number; cur: number; prev: number; pct: number; spike: boolean };
type Feedback = { id: string; content: string; channel: string; sentiment: string | null };

export default function TrendsPage() {
  const [rows, setRows] = useState<ThemeRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [drilldown, setDrilldown] = useState<Feedback[]>([]);

  useEffect(() => {
    fetch("/api/themes").then((r) => r.json()).then((d) => setRows(d.themes ?? []));
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/feedback?theme=${encodeURIComponent(selected)}&pageSize=50`)
      .then((r) => r.json())
      .then((d) => setDrilldown(d.items ?? []));
  }, [selected]);

  return (
    <div className="p-8 max-w-[1200px] mx-auto animate-fade-in relative">
      <div className="absolute top-20 left-0 w-[500px] h-[300px] bg-accent-amber/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="font-display text-4xl font-bold text-ink tracking-tight">Trends</div>
          <div className="text-[15px] font-medium text-slate-muted mt-2">Themes gaining or losing momentum, last 14 days vs the 14 before</div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white shadow-soft flex items-center justify-center border border-slate-100">
          <Activity size={24} className="text-primary-500" />
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden mb-8 shadow-soft animate-slide-up relative">
        <div className="absolute top-0 right-1/4 w-64 h-32 bg-primary-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-[1.6fr_120px_120px_140px_100px] px-8 py-5 text-[11px] font-bold text-slate-muted uppercase tracking-wider border-b border-slate-200/50 bg-white/40 backdrop-blur-sm relative z-10">
          <div>Theme</div><div>Total Volume</div><div>Last 14d</div><div>vs Prior 14d</div><div>Status</div>
        </div>
        <div className="divide-y divide-slate-100/50 bg-white/30 relative z-10">
          {rows.map((r, idx) => (
            <button key={r.id} onClick={() => setSelected(r.name)}
              className="w-full text-left grid grid-cols-[1.6fr_120px_120px_140px_100px] px-8 py-4 items-center text-[13px] hover:bg-primary-50/50 transition-colors group">
              <div className="flex items-center gap-3 font-semibold text-ink group-hover:text-primary-700 transition-colors">
                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: THEME_COLOR[r.name] ?? "#6366F1" }} />
                <span className="text-[14px]">{r.name}</span>
              </div>
              <div className="font-mono text-slate-600 bg-slate-100/50 w-fit px-2 py-0.5 rounded-md">{r.total}</div>
              <div className="font-mono text-slate-600 bg-slate-100/50 w-fit px-2 py-0.5 rounded-md">{r.cur}</div>
              <div className={`font-semibold flex items-center gap-1.5 ${r.pct > 0 ? "text-accent-coral" : r.pct < 0 ? "text-accent-sage" : "text-slate-400"}`}>
                {r.pct > 0 ? <ArrowUpRight size={16} /> : r.pct < 0 ? <ArrowDownRight size={16} /> : <Minus size={16} />}
                {Math.abs(r.pct)}%
              </div>
              <div>
                {r.spike && (
                  <span className="bg-accent-coral/10 text-accent-coral text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-accent-coral/20">Spiking</span>
                )}
              </div>
            </button>
          ))}
          {rows.length === 0 && <div className="py-12 text-center text-[13px] text-slate-muted font-medium">No trend data available.</div>}
        </div>
      </div>

      {selected && (
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-between items-center mb-5">
            <div className="font-display text-2xl font-bold text-ink flex items-center gap-2">
              <span className="text-slate-400 font-normal">Feedback tagged</span> "{selected}"
            </div>
            <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 hover:text-ink uppercase tracking-wider transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200/60 hover:bg-slate-50">
              <X size={14} /> Close
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {drilldown.map((it) => (
              <div key={it.id} className="glass-panel rounded-xl px-6 py-4 text-[13px] flex justify-between gap-6 hover:shadow-soft transition-shadow hover:border-primary-200 group">
                <div className="text-ink font-medium leading-relaxed">{it.content}</div>
                <div className="text-slate-muted text-[11px] font-bold uppercase tracking-wider whitespace-nowrap pt-1 group-hover:text-primary-500 transition-colors">{it.channel}</div>
              </div>
            ))}
            {drilldown.length === 0 && <div className="py-8 text-center text-slate-muted text-[13px] glass-panel rounded-xl">Loading feedback...</div>}
          </div>
        </div>
      )}
    </div>
  );
}
