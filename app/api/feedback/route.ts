import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/rbac";
import { classifyFeedback, embedText } from "@/lib/ai";
import { Role } from "@prisma/client";

// C4 — Feedback inbox: server-side pagination, filters, full-text search.
export async function GET(req: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "8", 10)));
  const q = searchParams.get("q");
  const channel = searchParams.get("channel");
  const sentiment = searchParams.get("sentiment");
  const theme = searchParams.get("theme");
  const status = searchParams.get("status");
  const days = searchParams.get("days");

  const where: any = { workspaceId: session!.user.workspaceId };
  if (q) where.content = { contains: q, mode: "insensitive" };
  if (channel) where.channel = channel;
  if (sentiment) where.sentiment = sentiment;
  if (status) where.status = status;
  if (theme) where.themes = { some: { theme: { name: theme } } };
  if (days) {
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days, 10));
    where.createdAt = { gte: since };
  }

  const [items, total] = await Promise.all([
    db.feedback.findMany({
      where,
      include: { themes: { include: { theme: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.feedback.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

const CreateSchema = z.object({
  content: z.string().min(1),
  channel: z.string().min(1),
  customerLabel: z.string().optional(),
  sourceRef: z.string().optional(),
});

// C3 — single-entry ingestion. AI1 — classify on ingest, not on every page
// load (Section 09, "Be economical").
export async function POST(req: Request) {
  const { session, error } = await requireSession([Role.ADMIN, Role.ANALYST]);
  if (error) return error;

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const workspaceId = session!.user.workspaceId;
  const existingThemes = await db.theme.findMany({ where: { workspaceId }, select: { name: true } });

  const classification = await classifyFeedback(parsed.data.content, existingThemes.map((t) => t.name));

  const themeRecords = await Promise.all(
    classification.themes.map((name) =>
      db.theme.upsert({
        where: { workspaceId_name: { workspaceId, name } },
        update: {},
        create: { workspaceId, name },
      })
    )
  );

  const feedback = await db.feedback.create({
    data: {
      content: parsed.data.content,
      channel: parsed.data.channel,
      customerLabel: parsed.data.customerLabel,
      sourceRef: parsed.data.sourceRef,
      sentiment: classification.sentiment,
      sentimentScore: classification.sentimentScore,
      featureArea: classification.featureArea,
      rationale: classification.rationale,
      status: "NEW",
      workspaceId,
      themes: { create: themeRecords.map((t) => ({ themeId: t.id, confidence: 0.85 })) },
    },
    include: { themes: { include: { theme: true } } },
  });

  // Embed for Ask LOOP retrieval. If the embeddings provider isn't configured
  // yet, don't fail the whole request — the item still saves and classifies.
  try {
    const vector = await embedText(parsed.data.content);
    await db.embedding.create({ data: { feedbackId: feedback.id, vector } });
  } catch (e) {
    console.warn("Embedding failed (non-fatal):", e);
  }

  return NextResponse.json(feedback, { status: 201 });
}
