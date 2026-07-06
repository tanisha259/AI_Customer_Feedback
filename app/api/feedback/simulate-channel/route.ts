import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/rbac";
import { classifyFeedback, embedText } from "@/lib/ai";
import { Role } from "@prisma/client";

// C3 acceptance criteria #3 — at least one "channel" button that seeds
// realistic items to simulate a real integration (App Store / Zendesk pull
// is explicitly out of scope per Section 4.2 — this mimics one).
const CHANNEL_BATCH = [
  { content: "Five stars. The Ask feature answered our onboarding question instantly with real quotes.", channel: "App Store Review", label: "Tidewell Partners" },
  { content: "Two stars — the app is slow to load our workspace every morning, takes almost ten seconds.", channel: "App Store Review", label: "Ashgrove Retail" },
  { content: "Four stars, would be five if the mobile app supported landscape mode.", channel: "App Store Review", label: "Pinehall Studio" },
];

export async function POST() {
  const { session, error } = await requireSession([Role.ADMIN, Role.ANALYST]);
  if (error) return error;

  const workspaceId = session!.user.workspaceId;
  const existingThemes = await db.theme.findMany({ where: { workspaceId }, select: { name: true } });
  const themeNames = existingThemes.map((t) => t.name);

  const created = [];
  for (const row of CHANNEL_BATCH) {
    const classification = await classifyFeedback(row.content, themeNames);
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
        content: row.content,
        channel: row.channel,
        customerLabel: row.label,
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
        featureArea: classification.featureArea,
        rationale: classification.rationale,
        status: "NEW",
        workspaceId,
        themes: { create: themeRecords.map((t) => ({ themeId: t.id, confidence: 0.85 })) },
      },
    });
    try {
      const vector = await embedText(row.content);
      await db.embedding.create({ data: { feedbackId: feedback.id, vector } });
    } catch { /* non-fatal */ }
    created.push(feedback);
  }

  return NextResponse.json({ imported: created.length, items: created });
}
