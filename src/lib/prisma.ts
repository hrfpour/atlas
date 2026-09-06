import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient instance.
 *
 * In development, Next.js hot-reloads modules repeatedly, which would
 * otherwise spawn a new PrismaClient (and a new connection pool) on every
 * reload — quickly exhausting the database's connection limit. We stash the
 * client on `globalThis` so the same instance is reused across reloads.
 *
 * In serverless environments (Vercel functions), each warm function instance
 * reuses the singleton via module caching, keeping connection churn low.
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
