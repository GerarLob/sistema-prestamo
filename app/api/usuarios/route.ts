import { getSessionAdminOr403, jsonError } from "@/lib/api-helpers";
import { usuarioCreateSchema } from "@/lib/validation/usuario";
import { crearUsuario, listarUsuarios } from "@/services/usuarioService";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { response } = await getSessionAdminOr403();
  if (response) return response;
  const rows = await listarUsuarios();
  return NextResponse.json(
    rows.map((u) => ({
      id: u.id,
      usuario: u.usuario,
      nombre: u.nombre,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const { response } = await getSessionAdminOr403();
  if (response) return response;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Cuerpo JSON inválido", 400);
  }
  const parsed = usuarioCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Validación", 400);
  }
  try {
    const u = await crearUsuario(parsed.data);
    return NextResponse.json(
      {
        id: u.id,
        usuario: u.usuario,
        nombre: u.nombre,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (e) {
    const m = e instanceof Error ? e.message : "Error al crear usuario";
    if (m.includes("Ya existe")) return jsonError(m, 409);
    return jsonError(m, 500);
  }
}
