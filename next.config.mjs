/** @type {import('next').NextConfig} */
if (process.env.NODE_ENV === "development") {
  if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = "dev-solo-nextauth-32c-no-produccion";
  }
  if (!process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET;
  }
  if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  }
}

const nextConfig = {};

export default nextConfig;
