import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton.
 *
 * In development, Next.js hot-reloads modules on every file change, which
 * would otherwise create a new PrismaClient (and a new DB connection pool)
 * on every save. Stashing the instance on `globalThis` avoids exhausting
 * the Postgres connection limit during local development.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
