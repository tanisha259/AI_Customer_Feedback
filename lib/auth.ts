import { type NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        console.log("Authorizing user:", credentials.email);
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) {
          console.log("User not found.");
          return null;
        }
        if (!user.passwordHash) {
          console.log("User has no passwordHash.");
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          console.log("Invalid password.");
          return null;
        }

        console.log("User authorized successfully:", user.id);

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
    async createUser(message) {
      const user = message.user;
      // If the user was created without a workspace (e.g. via Google OAuth)
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.workspaceId = (user as any).workspaceId;
      }
      
      // On first sign in with Google, the workspaceId might have been added in the createUser event
      // *after* the initial user object was created. Refetch if missing.
      if (!token.workspaceId && token.id) {
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
