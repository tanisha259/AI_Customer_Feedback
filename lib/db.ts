import { PrismaClient } from "@prisma/client";

// Standard Next.js singleton pattern — prevents exhausting Postgres
// connections from hot-reloading a new PrismaClient on every request in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Note: prisma client setup with global singleton
