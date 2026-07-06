import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/rbac";
import { classifyFeedback, embedText } from "@/lib/ai";
import { Role } from "@prisma/client";

const ImportSchema = z.object({ csvText: z.string().min(1) });

// C3 — CSV bulk upload: parse rows, report how many imported / how many
// failed (Section 08, C3 acceptance criteria #2). Expected columns per
// Appendix A: content, channel, customer_label, created_at (sentiment/themes
// left blank so the classifier fills them on import).
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    // Minimal CSV split — for quoted fields containing commas, swap this for
    // a proper parser (e.g. `csv-parse`) before production use.
    const cells = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

export async function POST(req: Request) {
  const { session, error } = await requireSession([Role.ADMIN, Role.ANALYST]);
  if (error) return error;

  const body = await req.json();
  const parsed = ImportSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const workspaceId = session!.user.workspaceId;
  const rows = parseCsv(parsed.data.csvText);

  const existingThemes = await db.theme.findMany({ where: { workspaceId }, select: { name: true } });
  const themeNames = existingThemes.map((t) => t.name);

  let imported = 0;
  const errors: { row: number; reason: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.content || !row.channel) {
      errors.push({ row: i + 2, reason: "Missing required column: content or channel" });
      continue;
    }
    try {
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
          customerLabel: row.customer_label || undefined,
          createdAt: row.created_at ? new Date(row.created_at) : undefined,
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
      } catch { /* non-fatal, see feedback/route.ts */ }
      imported++;
    } catch (e: any) {
      errors.push({ row: i + 2, reason: e?.message ?? "Unknown error" });
    }
  }

  return NextResponse.json({ imported, failed: errors.length, total: rows.length, errors });
}
