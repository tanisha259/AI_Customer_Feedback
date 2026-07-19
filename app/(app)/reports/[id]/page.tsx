"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, ArrowLeft, FileText, BarChart3, TrendingDown, TrendingUp } from "lucide-react";

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

  if (!report) return (
    <div className="p-8 max-w-4xl mx-auto flex items-center justify-center min-h-[60vh] animate-pulse">
      <div className="text-[13px] text-slate-muted font-medium bg-slate-100/50 px-6 py-3 rounded-full">Loading report…</div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/20 rounded-full blur-[100px] pointer-events-none -z-10" />

      <button onClick={() => router.push("/reports")} className="flex items-center gap-2 text-[12px] font-bold text-slate-500 hover:text-primary-600 mb-6 uppercase tracking-wider transition-colors hover:-translate-x-1">
        <ArrowLeft size={16} /> Back to reports
      </button>
      
      <div className="glass-panel rounded-[32px] p-10 shadow-float relative overflow-hidden">
        {/* Subtle decorative background for the report header */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary-50/50 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 text-primary-500 mb-3">
                <FileText size={20} />
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary-600">Voice of Customer Digest</span>
              </div>
              <h1 className="font-display text-4xl font-bold text-ink leading-tight">{report.title}</h1>
              <div className="text-[13px] text-slate-500 font-medium mt-3 flex items-center gap-3">
                <span>Generated on {new Date(report.createdAt).toLocaleDateString()}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span>Based on {report.contentJson.total} feedback items</span>
              </div>
            </div>
            
            <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200/60 bg-white shadow-sm text-[13px] font-bold text-slate-600 hover:text-primary-600 hover:border-primary-200 hover:shadow-soft transition-all">
              <Download size={16} /> Export / Print
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white/60 border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center">
                <BarChart3 size={20} />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Items Analyzed</div>
                <div className="font-display text-2xl font-bold text-ink mt-0.5">{report.contentJson.total}</div>
              </div>
            </div>
            
            <div className="bg-white/60 border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-sage/10 text-accent-sage flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Positive Sentiment</div>
                <div className="font-display text-2xl font-bold text-ink mt-0.5">{report.contentJson.posPct}%</div>
              </div>
            </div>
            
            <div className="bg-white/60 border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-coral/10 text-accent-coral flex items-center justify-center">
                <TrendingDown size={20} />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Negative Sentiment</div>
                <div className="font-display text-2xl font-bold text-ink mt-0.5">{report.contentJson.negPct}%</div>
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-ink prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700">
            {/* Split the narrative by double newlines to render proper paragraphs */}
            {report.narrative.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('Summary') || paragraph.startsWith('Top Themes') || paragraph.startsWith('Sentiment Shifts') || paragraph.startsWith('Recommended Actions')) {
                return <h2 key={idx} className="text-xl mt-8 mb-4">{paragraph}</h2>;
              }
              return <p key={idx} className="mb-4">{paragraph}</p>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
