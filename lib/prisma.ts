import "dotenv/config";
import { PrismaClient } from "@prisma/client";

export function getDatabaseUrlForClient(): string {
  const u = (process.env.DATABASE_URL || "").trim();
  if (!u) {
    throw new Error(
      "DATABASE_URL no está definida. Copia .env.example a .env y configura la cadena de PostgreSQL.",
    );
  }
  return u;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: getDatabaseUrlForClient() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
