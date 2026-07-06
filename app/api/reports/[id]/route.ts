import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, assertWorkspaceScope } from "@/lib/rbac";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const report = await db.report.findUnique({ where: { id: params.id } });
  if (!assertWorkspaceScope(report, session!.user.workspaceId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(report);
}
