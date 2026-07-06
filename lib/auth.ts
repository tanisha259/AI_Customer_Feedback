import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  // PrismaAdapter is needed to persist Google OAuth accounts/users to the DB.
  // We use strategy: "jwt" so no Session table rows are created — this is
  // required when mixing CredentialsProvider with an adapter, otherwise
  // sign-in after sign-out breaks because NextAuth looks for a DB session.
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          workspaceId: user.workspaceId,
        };
      },
    }),
  ],
  events: {
    // Auto-create a workspace for users who sign up via Google OAuth
    async createUser({ user }) {
      if (!(user as any).workspaceId) {
        const workspace = await db.workspace.create({
          data: {
            name: `${user.name?.split(" ")[0] || "My"}'s Workspace`,
          },
        });
        await db.user.update({
          where: { id: user.id },
          data: { workspaceId: workspace.id, role: "ADMIN" },
        });
      }
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // On initial sign-in, user object is present — store custom fields in token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.workspaceId = (user as any).workspaceId;
      }

      // For Google OAuth: workspaceId is assigned in the createUser event,
      // which fires after the JWT callback on first sign-in. Re-fetch from DB
      // if it's missing (only happens on very first Google sign-in).
      if (account?.provider === "google" && !token.workspaceId && token.id) {
        const dbUser = await db.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) {
          token.role = dbUser.role;
          token.workspaceId = dbUser.workspaceId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).workspaceId = token.workspaceId;
      }
      return session;
    },
  },
};

