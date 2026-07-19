"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ChevronRight, FileText } from "lucide-react";

type ReportSummary = { id: string; title: string; createdAt: string; contentJson: { total: number; negPct: number } };

export default function ReportsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const canGenerate = (session?.user?.role ?? "VIEWER") !== "VIEWER";

  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [period, setPeriod] = useState("7");
  const [busy, setBusy] = useState(false);

  function load() {
    fetch("/api/reports").then((r) => r.json()).then((d) => setReports(d.reports ?? []));
  }
  useEffect(() => { load(); }, []);

  async function generate() {
    setBusy(true);
    const res = await fetch("/api/reports", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ days: parseInt(period, 10) }),
    });
    const report = await res.json();
    setBusy(false);
    if (res.ok) router.push(`/reports/${report.id}`);
  }

  return (
    <div className="p-8 max-w-[1000px] mx-auto animate-fade-in relative">
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-primary-100/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      <div className="mb-8">
        <div className="font-display text-4xl font-bold text-ink tracking-tight flex items-center gap-3">
          <FileText className="text-primary-500" size={32} /> Reports
        </div>
        <div className="text-[15px] text-slate-muted mt-2 font-medium">Voice-of-Customer digests ready to forward to your team</div>
      </div>

      {canGenerate && (
        <div className="glass-panel rounded-3xl p-6 mb-10 flex items-center gap-6 shadow-soft animate-slide-up relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white shadow-glow flex-shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-[16px] text-ink">Generate a Voice-of-Customer report</div>
            <div className="text-[13px] text-slate-500 mt-1">Pre-computed stats + a Claude-written narrative, grounded in real feedback.</div>
          </div>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/50 text-[13px] font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer">
            <option value="7">Last 7 days</option><option value="14">Last 14 days</option><option value="30">Last 30 days</option>
          </select>
          <button onClick={generate} disabled={busy}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-[13px] shadow-soft hover:shadow-glow hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:shadow-none disabled:hover:translate-y-0 relative z-10">
            {busy ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} {busy ? "Generating…" : "Generate Report"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="font-display font-semibold text-lg text-ink mb-2">Recent Reports</h3>
        {reports.length === 0 && <div className="text-center text-[13px] text-slate-muted py-12 glass-panel rounded-2xl">No reports yet. Generate your first one above.</div>}
        {reports.map((r, i) => (
          <button key={r.id} onClick={() => router.push(`/reports/${r.id}`)}
            className="text-left glass-panel rounded-2xl px-6 py-5 flex justify-between items-center group hover:shadow-float hover:-translate-y-0.5 hover:border-primary-200 transition-all animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary-500 group-hover:bg-primary-50 transition-colors">
                <FileText size={18} />
              </div>
              <div>
                <div className="font-bold text-[15px] text-ink group-hover:text-primary-700 transition-colors">{r.title}</div>
                <div className="text-[12px] text-slate-500 font-medium flex items-center gap-2 mt-1">
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>{r.contentJson.total} items</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className={`${r.contentJson.negPct > 20 ? 'text-accent-coral' : 'text-slate-500'}`}>{r.contentJson.negPct}% negative</span>
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
              <ChevronRight size={16} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
