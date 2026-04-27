/** @type {import('next').NextConfig} */

/** En Vercel, NEXTAUTH_URL debe coincidir con la URL pública (cookies/callbacks). */
if (!process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

/** Dominio personalizado: si NEXTAUTH_URL ya está definido en el panel, tiene prioridad. */

if (process.env.NODE_ENV === "development") {
  if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = "dev-solo-nextauth-32c-no-produccion";
  }
  if (!process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET;
  }
  if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = "http://localhost:3020";
  }
}

/** Build en Vercel sin secreto → fallo explícito antes que /api/auth/error genérico. */
const onVercel = !!process.env.VERCEL;
if (onVercel && process.env.NODE_ENV === "production") {
  const secretOk = !!(process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim());
  if (!secretOk) {
    throw new Error(
      'Define NEXTAUTH_SECRET en Vercel → Settings → Environment Variables (Production). Ej.: ejecuta en tu PC: openssl rand -base64 32',
    );
  }
}

const nextConfig = {};

export default nextConfig;
