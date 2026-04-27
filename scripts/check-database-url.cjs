"use strict";

require("dotenv").config();

/** En Vercel las variables las defines en Settings → Environment Variables (Production). */

function main() {
  const u = (process.env.DATABASE_URL ?? "").trim();

  if (u.startsWith("file:")) {
    console.error(`
========================================
ERROR: DATABASE_URL usa SQLite (file:...).

Este proyecto usa PostgreSQL en prisma/schema.prisma.
Quitá la ruta file: y pone la cadena de Neon, Supabase o tu PostgreSQL local.

Ejemplo:
  postgresql://usuario:clave@localhost:5432/prestamos?schema=public

Remota (Neon): copia la URL desde el panel con ?sslmode=require
========================================
`);
    process.exit(1);
  }

  if (!u) {
    console.error(`
========================================
ERROR: DATABASE_URL no está definida.

En Vercel → tu proyecto → Settings → Environment Variables → Production:

  Name: DATABASE_URL

  Value: cadena PostgreSQL completa de Neon, Supabase o Vercel Postgres.

Ejemplo Neon:
postgresql://usuario:PASSWORD@xxxx.region.aws.neon.tech/neondb?sslmode=require

Sin esta variable fallan prisma generate y prisma migrate deploy.

Creá una BD gratuita en https://neon.tech si aún no tienes una.
========================================
`);
    process.exit(1);
  }

  if (!/^postgres(ql)?:\/\//i.test(u)) {
    console.error(
      "ERROR: DATABASE_URL debe empezar por postgresql:// o postgres://",
    );
    process.exit(1);
  }
}

main();
