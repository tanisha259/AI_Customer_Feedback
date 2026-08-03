/**
 * @file types/next-auth.d.ts
 * Module augmentation for NextAuth to add custom fields (id, role, workspaceId)
 * to the Session, User, and JWT types throughout the application.
 *
 * Without this file, accessing `session.user.role` or `session.user.workspaceId`
 * would require casting to `any` everywhere, which undermines type safety.
 */
import { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

// Module augmentation so `session.user.role` / `.workspaceId` are typed
// everywhere instead of falling back to `any`.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      workspaceId: string;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role: Role;
    workspaceId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    workspaceId: string;
  }
}
