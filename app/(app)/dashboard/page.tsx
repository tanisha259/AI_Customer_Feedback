"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, CartesianGrid,
} from "recharts";

const THEME_COLOR: Record<string, string> = {
  "Onboarding": "#4F46E5", "Billing & Invoicing": "#F59E0B", "Mobile Experience": "#10B981",
  "Performance & Speed": "#EF4444", "Integrations & SSO": "#0EA5E9", "Reporting & Exports": "#8B5CF6",
  "Customer Support": "#EC4899", "Pricing": "#D97706", "UI / UX Design": "#06B6D4",
  "Feature Requests": "#84CC16",
};

type Feedback = {
  id: string; content: string; channel: string; sentiment: "POS" | "NEU" | "NEG" | null;
  createdAt: string; themes: { theme: { name: string } }[];
};

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex-1 bg-surface border border-slate-200/60 shadow-soft hover:shadow-float transition-all duration-300 rounded-2xl px-6 py-5">
      <div className="text-[11px] font-bold text-slate-soft uppercase tracking-wider mb-2">{label}</div>
      <div className="font-display text-3xl font-bold" style={{ color: accent ?? "#0F172A" }}>{value}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-1 bg-surface border border-slate-200/60 shadow-soft rounded-2xl px-6 py-5 animate-pulse">
      <div className="h-3 w-24 bg-slate-200 rounded mb-4" />
      <div className="h-8 w-16 bg-slate-200 rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feedback?pageSize=500&days=90")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const now = Date.now();
  const negPct = items.length
    ? Math.round((items.filter((i) => i.sentiment === "NEG").length / items.length) * 100)
    : 0;
  const posPct = items.length
    ? Math.round((items.filter((i) => i.sentiment === "POS").length / items.length) * 100)
    : 0;
  const newThisWeek = items.filter((i) => now - new Date(i.createdAt).getTime() < 7 * 86400000).length;

  const volumeData = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const count = items.filter((it) => {
        const d = new Date(it.createdAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === day.getTime();
      }).length;
      days.push({ date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }), count });
    }
    return days;
  }, [items]);

  const sentimentData = [
    { name: "Positive", value: items.filter((i) => i.sentiment === "POS").length, color: "#10B981" },
    { name: "Neutral", value: items.filter((i) => i.sentiment === "NEU").length, color: "#94A3B8" },
    { name: "Negative", value: items.filter((i) => i.sentiment === "NEG").length, color: "#EF4444" },
  ];

  const themeCounts: Record<string, number> = {};
  items.forEach((it) => it.themes.forEach((ft) => {
    themeCounts[ft.theme.name] = (themeCounts[ft.theme.name] ?? 0) + 1;
  }));
  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  if (loading) return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 font-sans">
      <div>
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-3" />
        <div className="h-4 w-72 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="flex gap-5">
        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8 font-sans relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-violet/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      <div>
        <h1 className="font-display text-3xl font-bold text-ink tracking-tight">Dashboard</h1>
        <p className="text-slate-soft mt-1.5 font-medium">What your customers are telling you, at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard label="Total feedback" value={items.length} />
        <StatCard label="Positive" value={`${posPct}%`} accent="#10B981" />
        <StatCard label="Negative" value={`${negPct}%`} accent="#EF4444" />
        <StatCard label="New this week" value={newThisWeek} />
        <StatCard label="Active themes" value={Object.keys(themeCounts).length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-slate-200/60 shadow-soft rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg text-ink">Feedback volume</h2>
            <span className="text-xs font-medium text-slate-soft bg-slate-100 px-2 py-1 rounded-md">Last 30 days</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="4 4" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} interval={4} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ fontSize: 13, borderRadius: 12, border: "none", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.12)", padding: "12px 16px", fontWeight: 500 }} 
                itemStyle={{ color: "#0F172A" }}
              />
              <Area type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={3} fill="url(#volGrad)" activeDot={{ r: 6, strokeWidth: 0, fill: "#4F46E5" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface border border-slate-200/60 shadow-soft rounded-2xl p-6 flex flex-col">
          <h2 className="font-display font-semibold text-lg text-ink mb-6">Sentiment breakdown</h2>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sentimentData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={85} paddingAngle={5} cornerRadius={4}>
                  {sentimentData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 12, border: "none", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.12)", padding: "8px 12px", fontWeight: 500 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-5 mt-4">
            {sentimentData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />{d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-slate-200/60 shadow-soft rounded-2xl p-6">
        <h2 className="font-display font-semibold text-lg text-ink mb-6">Top themes</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={topThemes} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#0F172A", fontWeight: 500 }} axisLine={false} tickLine={false} width={160} />
            <Tooltip 
              cursor={{ fill: "#F8FAFC" }}
              contentStyle={{ fontSize: 13, borderRadius: 12, border: "none", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.12)", padding: "8px 12px", fontWeight: 500 }} 
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
              {topThemes.map((t, i) => <Cell key={i} fill={THEME_COLOR[t.name] ?? "#4F46E5"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
