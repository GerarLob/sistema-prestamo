import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function getSessionOr401() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { session: null, response: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  return { session, response: null };
}

/** Sesión autenticada y rol administrador. */
export async function getSessionAdminOr403() {
  const { response, session } = await getSessionOr401();
  if (response) return { session: null, response };
  if (session.user.role !== "admin") {
    return { session: null, response: jsonError("Solo un administrador puede realizar esta acción", 403) };
  }
  return { session, response: null };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function toNum(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") return parseFloat(v);
  if (v && typeof v === "object" && "toString" in v) return parseFloat(String(v));
  return Number(v);
}
