import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";

/**
 * Every API route handler that touches tenant data calls this first.
 * It returns either a valid session (guaranteed to carry workspaceId) or a
 * 401/403 NextResponse the caller should return immediately.
 *
 * This is the ONE place session + role checks live, so a route can't
 * accidentally skip them — see Section 06 "Non-negotiable security rule".
 */
export async function requireSession(allowedRoles?: Role[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.workspaceId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return { error: NextResponse.json({ error: "Forbidden — your role can't do this" }, { status: 403 }) };
  }

  return { session };
}

/** Throws-free guard: confirms a fetched row actually belongs to the caller's
 *  workspace before it's returned or mutated. Use this on every findUnique/
 *  update by id so a user can never reach another tenant's row by guessing
 *  an id in the URL, even though the WHERE clause should already prevent it —
 *  defense in depth per Section 06.
 */
export function assertWorkspaceScope<T extends { workspaceId: string }>(
  row: T | null,
  workspaceId: string
): row is T {
  return !!row && row.workspaceId === workspaceId;
}

// Note: role-based access control functions and checks
