import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";
import { NextRequest } from "next/server";

const handler = NextAuth(authOptions);

type RouteCtx = {
  params: { nextauth: string[] } | Promise<{ nextauth: string[] }>;
};

/**
 * NextAuth solo parsea el POST si el Content-Type es json o
 * x-www-form-urlencoded. Algunas peticiones (proxy, extensión) dejan
 * el header vacío: se reenvía el cuerpo con un Content-Type claro.
 */
function rebuildPostForNextAuth(req: NextRequest, rawBody: string) {
  const url = req.url;
  const headers = new Headers(req.headers);
  const t = rawBody.trim();
  if (t.startsWith("{")) {
    headers.set("content-type", "application/json; charset=utf-8");
    return new NextRequest(url, { method: "POST", headers, body: rawBody });
  }
  headers.set("content-type", "application/x-www-form-urlencoded; charset=utf-8");
  return new NextRequest(url, { method: "POST", headers, body: rawBody });
}

export async function GET(req: NextRequest, context: RouteCtx) {
  return handler(req, context);
}

export async function POST(req: NextRequest, context: RouteCtx) {
  const text = await req.text();
  return handler(rebuildPostForNextAuth(req, text), context);
}
