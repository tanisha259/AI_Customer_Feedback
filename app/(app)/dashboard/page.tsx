"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, CartesianGrid,
} from "recharts";

const THEME_COLOR: Record<string, string> = {
  "Onboarding": "#6E56CF", "Billing & Invoicing": "#E3A33E", "Mobile Experience": "#4F9A73",
  "Performance & Speed": "#D9534F", "Integrations & SSO": "#3B82A6", "Reporting & Exports": "#8A5CF6",
  "Customer Support": "#C2708A", "Pricing": "#B08968", "UI / UX Design": "#5C9EAD",
  "Feature Requests": "#7C9A4A",
};

type Feedback = {
  id: string; content: string; channel: string; sentiment: "POS" | "NEU" | "NEG" | null;
  createdAt: string; themes: { theme: { name: string } }[];
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex-1 bg-white border border-[#E7E2D6] rounded-2xl px-5 py-4">
      <div className="text-[11px] font-semibold text-[#6B6B80] uppercase tracking-wide">{label}</div>
      <div className="font-mono text-2xl font-semibold text-ink mt-1.5">{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dashboard pulls a wide window (last 90 days, page size 500) rather
    // than every row — for a real workload swap this for a dedicated
    // aggregate endpoint that runs GROUP BY in Postgres.
    fetch("/api/feedback?pageSize=500&days=90")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const now = Date.now();
  const negPct = items.length
    ? Math.round((items.filter((i) => i.sentiment === "NEG").length / items.length) * 100)
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
    { name: "Positive", value: items.filter((i) => i.sentiment === "POS").length, color: "#4F9A73" },
    { name: "Neutral", value: items.filter((i) => i.sentiment === "NEU").length, color: "#8A8AA0" },
    { name: "Negative", value: items.filter((i) => i.sentiment === "NEG").length, color: "#D9534F" },
  ];

  const themeCounts: Record<string, number> = {};
  items.forEach((it) => it.themes.forEach((ft) => {
    themeCounts[ft.theme.name] = (themeCounts[ft.theme.name] ?? 0) + 1;
  }));
  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  if (loading) return <div className="p-8 text-sm text-[#6B6B80]">Loading dashboard…</div>;

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <div className="font-display text-2xl font-semibold text-ink">Dashboard</div>
        <div className="text-sm text-[#6B6B80] mt-0.5">What your customers are telling you, at a glance</div>
      </div>

      <div className="flex gap-4">
        <StatCard label="Total feedback" value={items.length} />
        <StatCard label="Negative (window)" value={`${negPct}%`} />
        <StatCard label="New this week" value={newThisWeek} />
        <StatCard label="Active themes" value={Object.keys(themeCounts).length} />
      </div>

      <div className="flex gap-5">
        <div className="flex-[2] bg-white border border-[#E7E2D6] rounded-2xl p-5">
          <div className="font-semibold text-sm text-ink mb-3">Feedback volume — last 30 days</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={volumeData}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6E56CF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6E56CF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E7E2D6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B6B80" }} interval={4} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6B6B80" }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E7E2D6" }} />
              <Area type="monotone" dataKey="count" stroke="#6E56CF" strokeWidth={2} fill="url(#volGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 bg-white border border-[#E7E2D6] rounded-2xl p-5">
          <div className="font-semibold text-sm text-ink mb-3">Sentiment breakdown</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {sentimentData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E7E2D6" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {sentimentData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-[#6B6B80]">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />{d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#E7E2D6] rounded-2xl p-5">
        <div className="font-semibold text-sm text-ink mb-3">Top themes</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={topThemes} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" tick={{ fontSize: 10, fill: "#6B6B80" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11.5, fill: "#20203A" }} axisLine={false} tickLine={false} width={140} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E7E2D6" }} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {topThemes.map((t, i) => <Cell key={i} fill={THEME_COLOR[t.name] ?? "#6E56CF"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
