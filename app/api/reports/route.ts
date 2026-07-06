import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/rbac";
import { generateReportNarrative, type ReportStats } from "@/lib/ai";
import { Role } from "@prisma/client";

// C-list — saved reports, scoped to workspace.
export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const reports = await db.report.findMany({
    where: { workspaceId: session!.user.workspaceId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, periodStart: true, periodEnd: true, createdAt: true, contentJson: true },
  });
  return NextResponse.json({ reports });
}

const GenerateSchema = z.object({ days: z.number().int().positive().default(7) });

// AI4 — Voice-of-Customer report. Stats are computed here directly from
// Postgres (never guessed), then handed to Claude to narrate — Section 09.3
// "this keeps the report accurate and cheap, and stops the model from
// hallucinating figures."
export async function POST(req: Request) {
  const { session, error } = await requireSession([Role.ADMIN, Role.ANALYST]);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const parsed = GenerateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const workspaceId = session!.user.workspaceId;
  const days = parsed.data.days;
  const now = new Date();
  const periodStart = new Date(now.getTime() - days * 86400000);
  const priorStart = new Date(now.getTime() - days * 2 * 86400000);

  const [periodItems, priorItems] = await Promise.all([
    db.feedback.findMany({
      where: { workspaceId, createdAt: { gte: periodStart } },
      include: { themes: { include: { theme: true } } },
    }),
    db.feedback.findMany({
      where: { workspaceId, createdAt: { gte: priorStart, lt: periodStart } },
      include: { themes: { include: { theme: true } } },
    }),
  ]);

  const total = periodItems.length;
  const negPct = total ? Math.round((periodItems.filter((i) => i.sentiment === "NEG").length / total) * 100) : 0;
  const posPct = total ? Math.round((periodItems.filter((i) => i.sentiment === "POS").length / total) * 100) : 0;

  const countByTheme = (list: typeof periodItems) => {
    const m: Record<string, number> = {};
    list.forEach((it) => it.themes.forEach((ft) => { m[ft.theme.name] = (m[ft.theme.name] ?? 0) + 1; }));
    return m;
  };
  const curCounts = countByTheme(periodItems);
  const priorCounts = countByTheme(priorItems);
  const topThemes = Object.entries(curCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  let spike: ReportStats["spike"] = null;
  Object.entries(curCounts).forEach(([name, count]) => {
    const prev = priorCounts[name] ?? 0;
    const pct = prev === 0 ? (count > 0 ? 100 : 0) : Math.round(((count - prev) / prev) * 100);
    if (count >= 2 && (!spike || pct > spike.pct)) spike = { name, pct };
  });

  const negQuotes = periodItems.filter((i) => i.sentiment === "NEG").slice(0, 3).map((i) => i.content);
  const posQuotes = periodItems.filter((i) => i.sentiment === "POS").slice(0, 3).map((i) => i.content);

  const stats: ReportStats = { total, negPct, posPct, topThemes, spike, negQuotes, posQuotes };
  const periodLabel = days === 7 ? "the last 7 days" : days === 14 ? "the last 14 days" : `the last ${days} days`;
  const narrative = await generateReportNarrative(periodLabel, stats);

  const report = await db.report.create({
    data: {
      title: `Voice-of-Customer — ${periodLabel}`,
      periodStart,
      periodEnd: now,
      contentJson: stats as any,
      narrative,
      workspaceId,
      generatedBy: session!.user.id,
    },
  });

  return NextResponse.json(report, { status: 201 });
}
