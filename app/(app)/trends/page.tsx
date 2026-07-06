"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

const THEME_COLOR: Record<string, string> = {
  "Onboarding": "#6E56CF", "Billing & Invoicing": "#E3A33E", "Mobile Experience": "#4F9A73",
  "Performance & Speed": "#D9534F", "Integrations & SSO": "#3B82A6", "Reporting & Exports": "#8A5CF6",
  "Customer Support": "#C2708A", "Pricing": "#B08968", "UI / UX Design": "#5C9EAD",
  "Feature Requests": "#7C9A4A",
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
    <div className="p-8">
      <div className="mb-6">
        <div className="font-display text-2xl font-semibold text-ink">Trends</div>
        <div className="text-sm text-[#6B6B80] mt-0.5">Themes gaining or losing momentum, last 14 days vs the 14 before</div>
      </div>

      <div className="bg-white border border-[#E7E2D6] rounded-2xl overflow-hidden mb-6">
        <div className="grid grid-cols-[1.6fr_100px_100px_130px_90px] px-4 py-2.5 text-[11px] font-bold text-[#6B6B80] uppercase border-b border-[#E7E2D6]">
          <div>Theme</div><div>Total</div><div>Last 14d</div><div>vs prior 14d</div><div></div>
        </div>
        {rows.map((r) => (
          <button key={r.id} onClick={() => setSelected(r.name)}
            className="w-full text-left grid grid-cols-[1.6fr_100px_100px_130px_90px] px-4 py-3 border-b border-[#E7E2D6] items-center text-sm hover:bg-[#FAF8F3]">
            <div className="flex items-center gap-2 font-semibold text-ink">
              <span className="w-2 h-2 rounded-full" style={{ background: THEME_COLOR[r.name] ?? "#6E56CF" }} />{r.name}
            </div>
            <div className="font-mono">{r.total}</div>
            <div className="font-mono">{r.cur}</div>
            <div className={`font-semibold flex items-center gap-1 ${r.pct > 0 ? "text-coral" : r.pct < 0 ? "text-sage" : "text-[#6B6B80]"}`}>
              {r.pct > 0 ? <ArrowUpRight size={13} /> : r.pct < 0 ? <ArrowDownRight size={13} /> : <Minus size={13} />}
              {Math.abs(r.pct)}%
            </div>
            <div>{r.spike && <span className="bg-[#FBEAE9] text-[#A83A36] text-[11px] font-semibold px-2 py-0.5 rounded-full">Spiking</span>}</div>
          </button>
        ))}
      </div>

      {selected && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div className="font-display text-lg font-semibold">Feedback tagged "{selected}"</div>
            <button onClick={() => setSelected(null)} className="text-xs text-[#6B6B80]">Close ✕</button>
          </div>
          <div className="flex flex-col gap-2">
            {drilldown.map((it) => (
              <div key={it.id} className="bg-white border border-[#E7E2D6] rounded-lg px-4 py-3 text-sm flex justify-between gap-3">
                <div>{it.content}</div>
                <div className="text-[#6B6B80] text-xs whitespace-nowrap">{it.channel}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
