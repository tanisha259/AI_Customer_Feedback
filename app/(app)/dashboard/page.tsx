"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, CartesianGrid,
} from "recharts";

const THEME_COLOR: Record<string, string> = {
  "Onboarding": "#6366F1", "Billing & Invoicing": "#F59E0B", "Mobile Experience": "#10B981",
  "Performance & Speed": "#EF4444", "Integrations & SSO": "#06B6D4", "Reporting & Exports": "#8B5CF6",
  "Customer Support": "#EC4899", "Pricing": "#D97706", "UI / UX Design": "#3B82F6",
  "Feature Requests": "#84CC16",
};

type Feedback = {
  id: string; content: string; channel: string; sentiment: "POS" | "NEU" | "NEG" | null;
  createdAt: string; themes: { theme: { name: string } }[];
};

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex-1 glass-panel rounded-2xl px-6 py-5 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke={accent ?? "#6366F1"} strokeWidth="8"/>
        </svg>
      </div>
      <div className="text-[11px] font-bold text-slate-muted uppercase tracking-wider mb-2 relative z-10">{label}</div>
      <div className="font-display text-4xl font-bold relative z-10" style={{ color: accent ?? "#0B0F19" }}>{value}</div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex-1 glass-panel rounded-2xl px-6 py-5 animate-pulse">
      <div className="h-3 w-24 bg-slate-200/50 rounded mb-4" />
      <div className="h-9 w-20 bg-slate-200/50 rounded" />
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
    <div className="p-8 max-w-[1400px] mx-auto flex flex-col gap-8 font-sans">
      <div>
        <div className="h-9 w-56 bg-slate-200/50 rounded animate-pulse mb-3" />
        <div className="h-4 w-80 bg-slate-200/50 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto flex flex-col gap-8 font-sans relative">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      <div className="animate-fade-in">
        <h1 className="font-display text-4xl font-bold text-ink tracking-tight">Dashboard</h1>
        <p className="text-slate-soft mt-2 text-[15px] font-medium">An overview of your customer intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <StatCard label="Total feedback" value={items.length} accent="#6366F1" />
        <StatCard label="Positive" value={`${posPct}%`} accent="#10B981" />
        <StatCard label="Negative" value={`${negPct}%`} accent="#EF4444" />
        <StatCard label="New this week" value={newThisWeek} accent="#06B6D4" />
        <StatCard label="Active themes" value={Object.keys(themeCounts).length} accent="#F59E0B" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="lg:col-span-2 glass-panel rounded-2xl p-7 hover:shadow-float transition-shadow duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-semibold text-xl text-ink">Feedback Volume</h2>
            <span className="text-[11px] font-bold text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-full tracking-wide">LAST 30 DAYS</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" opacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94A3B8" }} interval={4} axisLine={false} tickLine={false} dy={15} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ fontSize: 13, borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.12)", padding: "12px 16px", fontWeight: 600 }} 
                itemStyle={{ color: "#0B0F19" }}
              />
              <Area type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={3} fill="url(#volGrad)" activeDot={{ r: 6, strokeWidth: 2, stroke: "#FFF", fill: "#6366F1" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel rounded-2xl p-7 flex flex-col hover:shadow-float transition-shadow duration-300">
          <h2 className="font-display font-semibold text-xl text-ink mb-6">Sentiment Breakdown</h2>
          <div className="flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sentimentData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4} cornerRadius={6}>
                  {sentimentData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.12)", padding: "8px 12px", fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {sentimentData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-[13px] font-medium text-slate-soft">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ background: d.color }} />{d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-7 animate-slide-up hover:shadow-float transition-shadow duration-300" style={{ animationDelay: '0.3s' }}>
        <h2 className="font-display font-semibold text-xl text-ink mb-6">Top Themes</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={topThemes} layout="vertical" margin={{ left: 0, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: "#0B0F19", fontWeight: 500 }} axisLine={false} tickLine={false} width={180} />
            <Tooltip 
              cursor={{ fill: "rgba(241, 245, 249, 0.5)" }}
              contentStyle={{ fontSize: 13, borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.12)", padding: "8px 12px", fontWeight: 600 }} 
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
              {topThemes.map((t, i) => <Cell key={i} fill={THEME_COLOR[t.name] ?? "#6366F1"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
