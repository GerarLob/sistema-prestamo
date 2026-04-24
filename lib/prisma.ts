import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import path from "path";

/**
 * Misma lógica que `prisma db push`: partimos de `DATABASE_URL` y, si es SQLite
 * con ruta relativa `file:./...`, la resolvemos a absoluta para evitar abrir otro
 * `dev.db` distinto al de la CLI.
 * PostgreSQL: se devuelve sin cambios.
 */
export function getDatabaseUrlForClient(): string {
  const u = (process.env.DATABASE_URL || "file:./prisma/dev.db").trim();
  if (u.startsWith("postgresql:") || u.startsWith("postgres:")) {
    return u;
  }
  if (!u.startsWith("file:")) {
    return u;
  }
  const raw = u
    .slice("file:".length)
    .replace(/\\/g, "/");
  const withoutLeading = raw.replace(/^\/+/, "");
  const resolved = path.isAbsolute(withoutLeading)
    ? withoutLeading
    : path.join(process.cwd(), withoutLeading);
  return "file:" + resolved.split(path.sep).join("/");
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: getDatabaseUrlForClient() } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
