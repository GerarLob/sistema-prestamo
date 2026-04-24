import { getSessionAdminOr403, jsonError } from "@/lib/api-helpers";
import { usuarioUpdateSchema } from "@/lib/validation/usuario";
import { actualizarUsuario, eliminarUsuario } from "@/services/usuarioService";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { response } = await getSessionAdminOr403();
  if (response) return response;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Cuerpo JSON inválido", 400);
  }
  const parsed = usuarioUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Validación", 400);
  }
  const { nombre, role, password } = parsed.data;
  if (nombre === undefined && role === undefined && password === undefined) {
    return jsonError("Indica nombre, rol o contraseña nueva", 400);
  }
  try {
    const u = await actualizarUsuario(params.id, { nombre, role, password });
    return NextResponse.json({
      id: u.id,
      usuario: u.usuario,
      nombre: u.nombre,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : "Error";
    if (m.includes("no encontrado")) return jsonError(m, 404);
    if (m.includes("administrador")) return jsonError(m, 400);
    return jsonError(m, 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { response, session } = await getSessionAdminOr403();
  if (response) return response;
  try {
    await eliminarUsuario(params.id, session!.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const m = e instanceof Error ? e.message : "Error";
    if (m.includes("no encontrado")) return jsonError(m, 404);
    if (m.includes("propia") || m.includes("administrador")) {
      return jsonError(m, 400);
    }
    return jsonError(m, 500);
  }
}
