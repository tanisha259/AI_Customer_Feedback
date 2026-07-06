import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

// C1 — Sign-up creates a User AND a Workspace; the creator becomes ADMIN
// (Section 08, C1 acceptance criteria #1).
const SignupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  workspaceName: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, email, password, workspaceName } = parsed.data;

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await db.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({ data: { name: workspaceName } });
    const user = await tx.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: Role.ADMIN,
        workspaceId: workspace.id,
      },
    });
    return { workspace, user };
  });

  return NextResponse.json({ ok: true, userId: result.user.id });
}
