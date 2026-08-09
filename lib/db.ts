import { PrismaClient } from "@prisma/client";

// Standard Next.js singleton pattern — prevents exhausting Postgres
// connections from hot-reloading a new PrismaClient on every request in dev.
// This is necessary because Next.js clears the Node.js cache on module hot reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Singleton PrismaClient instance.
 * Import this into API routes and server actions to interact with the database.
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
