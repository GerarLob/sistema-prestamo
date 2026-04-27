/**
 * En Vercel, si no definiste NEXTAUTH_URL, se usa VERCEL_URL (dominio de despliegue).
 * Importar al inicio de middleware o lib/auth para que cookies y callbacks usen https.
 */
if (
  typeof process !== "undefined" &&
  !(process.env.NEXTAUTH_URL ?? "").trim() &&
  process.env.VERCEL_URL
) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}
