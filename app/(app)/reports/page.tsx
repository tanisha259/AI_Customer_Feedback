"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";

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
    <div className="p-8">
      <div className="mb-6">
        <div className="font-display text-2xl font-semibold text-ink">Reports</div>
        <div className="text-sm text-[#6B6B80] mt-0.5">Voice-of-Customer digests ready to forward</div>
      </div>

      {canGenerate && (
        <div className="bg-white border border-[#E7E2D6] rounded-2xl p-5 mb-6 flex items-center gap-3.5">
          <div className="flex-1">
            <div className="font-semibold text-sm text-ink">Generate a Voice-of-Customer report</div>
            <div className="text-xs text-[#6B6B80] mt-0.5">Pre-computed stats + a Claude-written narrative, grounded in this period's real feedback.</div>
          </div>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 rounded-lg border border-[#E7E2D6] text-sm">
            <option value="7">Last 7 days</option><option value="14">Last 14 days</option><option value="30">Last 30 days</option>
          </select>
          <button onClick={generate} disabled={busy}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-violet text-white font-semibold text-sm disabled:opacity-60">
            {busy ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />} {busy ? "Generating…" : "Generate"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {reports.length === 0 && <div className="text-center text-sm text-[#6B6B80] py-10">No reports yet. Generate the first one above.</div>}
        {reports.map((r) => (
          <button key={r.id} onClick={() => router.push(`/reports/${r.id}`)}
            className="text-left bg-white border border-[#E7E2D6] rounded-xl px-5 py-4 flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm text-ink">{r.title}</div>
              <div className="text-xs text-[#6B6B80] mt-0.5">
                {new Date(r.createdAt).toLocaleDateString()} · {r.contentJson.total} items · {r.contentJson.negPct}% negative
              </div>
            </div>
            <ChevronRight size={16} className="text-[#6B6B80]" />
          </button>
        ))}
      </div>
    </div>
  );
}
