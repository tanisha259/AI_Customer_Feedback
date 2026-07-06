import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, assertWorkspaceScope } from "@/lib/rbac";
import { classifyFeedback } from "@/lib/ai";
import { Role } from "@prisma/client";

// AI1 acceptance criteria #4 — a manual "re-classify" action for corrections.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession([Role.ADMIN, Role.ANALYST]);
  if (error) return error;

  const existing = await db.feedback.findUnique({ where: { id: params.id } });
  if (!assertWorkspaceScope(existing, session!.user.workspaceId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const workspaceId = session!.user.workspaceId;
  const existingThemes = await db.theme.findMany({ where: { workspaceId }, select: { name: true } });
  const classification = await classifyFeedback(existing.content, existingThemes.map((t) => t.name));

  const themeRecords = await Promise.all(
    classification.themes.map((name) =>
      db.theme.upsert({
        where: { workspaceId_name: { workspaceId, name } },
        update: {},
        create: { workspaceId, name },
      })
    )
  );

  await db.feedbackTheme.deleteMany({ where: { feedbackId: params.id } });

  const updated = await db.feedback.update({
    where: { id: params.id },
    data: {
      sentiment: classification.sentiment,
      sentimentScore: classification.sentimentScore,
      featureArea: classification.featureArea,
      rationale: classification.rationale,
      themes: { create: themeRecords.map((t) => ({ themeId: t.id, confidence: 0.85 })) },
    },
    include: { themes: { include: { theme: true } } },
  });

  return NextResponse.json(updated);
}
