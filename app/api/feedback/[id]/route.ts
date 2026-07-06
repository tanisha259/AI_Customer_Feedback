import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession, assertWorkspaceScope } from "@/lib/rbac";
import { Role, FeedbackStatus } from "@prisma/client";

const PatchSchema = z.object({ status: z.nativeEnum(FeedbackStatus) });

// C4 — status workflow: NEW -> REVIEWED -> ACTIONED, changeable inline.
// Never trust the id alone: fetch, confirm workspace match, THEN mutate —
// so Company A can never edit Company B's row by guessing an id in the URL.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession([Role.ADMIN, Role.ANALYST]);
  if (error) return error;

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await db.feedback.findUnique({ where: { id: params.id } });
  if (!assertWorkspaceScope(existing, session!.user.workspaceId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.feedback.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json(updated);
}
