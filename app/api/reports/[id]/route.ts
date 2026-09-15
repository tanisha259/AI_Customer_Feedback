import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession, assertWorkspaceScope } from "@/lib/rbac";

/**
 * Retrieves a single generated report by ID.
 * Returns 404 if the report does not exist or belongs to another workspace.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { session, error } = await requireSession();
  if (error) return error;

  const report = await db.report.findUnique({ where: { id: params.id } });
  if (!assertWorkspaceScope(report, session!.user.workspaceId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(report);
}
