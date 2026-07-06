"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download } from "lucide-react";

type Report = {
  id: string; title: string; createdAt: string; narrative: string;
  contentJson: { total: number; negPct: number; posPct: number };
};

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    fetch(`/api/reports/${id}`).then((r) => r.json()).then(setReport);
  }, [id]);

  if (!report) return <div className="p-8 text-sm text-[#6B6B80]">Loading report…</div>;

  return (
    <div className="p-8 max-w-3xl">
      <button onClick={() => router.push("/reports")} className="text-xs text-[#6B6B80] mb-4">← Back to reports</button>
      <div className="bg-white border border-[#E7E2D6] rounded-2xl p-8">
        <div className="font-display text-2xl font-semibold text-ink">{report.title}</div>
        <div className="text-xs text-[#6B6B80] mt-1 mb-5">
          Generated {new Date(report.createdAt).toLocaleString()} · {report.contentJson.total} feedback items analyzed
        </div>

        <div className="flex gap-3 mb-6">
          {[
            ["Items", report.contentJson.total],
            ["Negative", `${report.contentJson.negPct}%`],
            ["Positive", `${report.contentJson.posPct}%`],
          ].map(([label, value]) => (
            <div key={label as string} className="flex-1 bg-paper border border-[#E7E2D6] rounded-xl px-4 py-3">
              <div className="text-[11px] font-semibold text-[#6B6B80] uppercase">{label}</div>
              <div className="font-mono text-xl font-semibold text-ink mt-1">{value}</div>
            </div>
          ))}
        </div>

        <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{report.narrative}</div>

        <button onClick={() => window.print()} className="mt-6 flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E7E2D6] bg-paper text-xs font-semibold">
          <Download size={13} /> Export / print
        </button>
      </div>
    </div>
  );
}
