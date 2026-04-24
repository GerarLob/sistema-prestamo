import { getSessionOr401, jsonError } from "@/lib/api-helpers";
import { eliminarPago } from "@/services/pagoService";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: { id: string } };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { response, session } = await getSessionOr401();
  if (response) return response;
  if (!session) return jsonError("No autorizado", 401);
  if (session.user.role !== "admin") {
    return jsonError("Solo el administrador puede anular un pago", 403);
  }
  try {
    await eliminarPago(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const m = e instanceof Error ? e.message : "Error";
    if (m.includes("not found") || m.includes("Record to delete")) {
      return jsonError("Pago no encontrado", 404);
    }
    return jsonError(m, 500);
  }
}
