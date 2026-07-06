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
      { error: "Embeddings provider isn't configured — set VOYAGE_API_KEY to enable Ask LOOP." },
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
