/**
 * @file app/api/insights/route.ts
 * Ask LOOP — RAG-based Q&A endpoint (AI3).
 *
 * POST /api/insights  — Accepts a natural-language question and answers it
 *   using only feedback items that belong to the caller's workspace:
 *     1. Embed the question via Gemini embeddings.
 *     2. Cosine-similarity search over workspace-scoped stored embeddings.
 *     3. Pass the top-K items to Gemini with a grounding instruction.
 *     4. Return the answer and the exact cited items so users can verify it.
 *
 *   If the embeddings provider is unavailable (missing GEMINI_API_KEY),
 *   a 503 is returned instead of silently returning a hallucinated answer.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/rbac";
import { embedText, answerFromFeedback } from "@/lib/ai";
import { retrieveTopK } from "@/lib/search";

const AskSchema = z.object({ question: z.string().min(1) });

// AI3 — Ask LOOP grounded Q&A. Retrieve-then-answer per Section 09.2:
// 1) embed the question, 2) cosine-similarity search over this workspace's
// stored embeddings only (never another tenant's), 3) pass just those items
// to Claude with a grounding instruction, 4) return the answer + the exact
// items it used so the person can verify it.
export async function POST(req: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await req.json();
  const parsed = AskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const workspaceId = session!.user.workspaceId;

  const candidates = await db.embedding.findMany({
    where: { feedback: { workspaceId } },
    include: { feedback: { select: { id: true, content: true, channel: true, sentiment: true } } },
  });

  if (candidates.length === 0) {
    return NextResponse.json({
      answer: "There's no feedback in this workspace yet — add or import some first.",
      cited: [],
    });
  }

  let questionVector: number[];
  try {
    questionVector = await embedText(parsed.data.question);
  } catch (e) {
    return NextResponse.json(
      { error: "Embeddings provider isn't configured — set GEMINI_API_KEY to enable Ask LOOP." },
      { status: 503 }
    );
  }

  const top = retrieveTopK(
    questionVector,
    candidates.map((c) => ({ vector: c.vector, payload: c.feedback })),
    6
  );

  const answer = await answerFromFeedback(parsed.data.question, top as any);

  return NextResponse.json({ answer, cited: top });
}
