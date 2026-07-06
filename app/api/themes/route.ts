import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/rbac";

// AI2 — Theme clustering & trends. Counts total / last-14-days / prior-14-days
// per theme so the caller can flag spikes (Section 08, AI2 acceptance
// criteria #2).
export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const workspaceId = session!.user.workspaceId;
  const now = new Date();
  const day = 86400000;
  const recentSince = new Date(now.getTime() - 14 * day);
  const priorSince = new Date(now.getTime() - 28 * day);

  const themes = await db.theme.findMany({
    where: { workspaceId },
    include: {
      feedback: {
        include: { feedback: { select: { createdAt: true } } },
      },
    },
  });

  const rows = themes
    .map((theme) => {
      const dates = theme.feedback.map((ft) => ft.feedback.createdAt);
      const total = dates.length;
      const cur = dates.filter((d) => d >= recentSince).length;
      const prev = dates.filter((d) => d >= priorSince && d < recentSince).length;
      const pct = prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100);
      return {
        id: theme.id,
        name: theme.name,
        color: theme.color,
        total,
        cur,
        prev,
        pct,
        spike: pct >= 40 && cur >= 2,
      };
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total);

  return NextResponse.json({ themes: rows });
}
