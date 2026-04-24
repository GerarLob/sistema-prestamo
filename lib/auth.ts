import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/enums";
import type { User } from "next-auth";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/** Mismo valor que `next.config.mjs` en desarrollo si no hay .env. */
const DEV_AUTH_SECRET = "dev-solo-nextauth-32c-no-produccion";

function buildAuthSecret(): string | undefined {
  const a = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  if (a) return a;
  if (process.env.NODE_ENV === "development") return DEV_AUTH_SECRET;
  return undefined;
}

/** Busca por nombre de usuario normalizado (minúsculas). */
function variantesLogin(ingresado: string): string[] {
  const u = ingresado.trim().toLowerCase();
  if (!u) return [];
  return [u];
}

function origenEquivalenLocal(a: string, b: string): boolean {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    if (ua.port !== ub.port) return false;
    if (ua.origin === ub.origin) return true;
    const h = (x: string) => (x === "127.0.0.1" ? "localhost" : x);
    ua.hostname = h(ua.hostname);
    ub.hostname = h(ub.hostname);
    return ua.origin === ub.origin;
  } catch {
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  useSecureCookies: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: buildAuthSecret(),
  pages: { signIn: "/login" },
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "Usuario y contraseña",
      credentials: {
        usuario: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const c = credentials as Record<string, string> | undefined;
        const loginIngresado =
          (typeof c?.usuario === "string" && c.usuario.trim()) ||
          (typeof c?.email === "string" && c.email.trim()) ||
          "";
        const passRaw = c?.password;
        const password = typeof passRaw === "string" ? passRaw : passRaw != null ? String(passRaw) : "";
        if (!loginIngresado || !password) return null;
        const claves = variantesLogin(loginIngresado);
        if (claves.length === 0) return null;
        try {
          type Fila = {
            id: string;
            usuario: string;
            passwordHash: string;
            nombre: string;
            role: string;
          };
          let candidatos: Fila[] = await prisma.usuario.findMany({
            where: { usuario: { in: claves } },
            take: 10,
            select: { id: true, usuario: true, passwordHash: true, nombre: true, role: true },
          });
          if (candidatos.length === 0) {
            const n = claves[0] ?? "";
            const raw = await prisma.$queryRaw<Fila[]>`
              SELECT id, usuario, "passwordHash", nombre, role
              FROM Usuario
              WHERE LOWER(usuario) = LOWER(${n})
              LIMIT 5`;
            candidatos = raw;
          }
          if (candidatos.length === 0) {
            if (process.env.NODE_ENV === "development") {
              console.warn("[auth] Ningún usuario coincide con las credenciales.");
            }
            return null;
          }
          for (const row of candidatos) {
            const ok = await compare(password, row.passwordHash);
            if (ok) {
              const email = row.usuario.includes("@")
                ? row.usuario
                : `${row.usuario}@sistema.local`;
              const u: User = {
                id: row.id,
                name: row.nombre,
                email,
                usuario: row.usuario,
                role: row.role as UserRole,
              };
              return u;
            }
          }
          return null;
        } catch (e) {
          console.error("[auth] Error al acceder a la base de datos:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (origenEquivalenLocal(url, baseUrl)) {
        return url;
      }
      try {
        const u = new URL(url);
        const b = new URL(baseUrl);
        if (u.origin === b.origin) return url;
        return baseUrl;
      } catch {
        return baseUrl;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as UserRole) ?? "usuario";
        token.name = user.name;
        token.usuario = (user as { usuario?: string }).usuario ?? user.email ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = String(token.name ?? session.user.name ?? "");
        session.user.usuario = String(token.usuario ?? "");
        session.user.role = (token.role as UserRole) ?? "usuario";
      }
      return session;
    },
  },
};

export type SessionUser = {
  id: string;
  usuario: string;
  name: string;
  role: UserRole;
};
