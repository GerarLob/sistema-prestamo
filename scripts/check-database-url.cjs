"use strict";

/** En Vercel las variables las defines en Settings → Environment Variables (Production). */

function main() {
  const u = (process.env.DATABASE_URL ?? "").trim();

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
