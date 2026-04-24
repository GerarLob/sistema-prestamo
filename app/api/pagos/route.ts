import { getSessionOr401, jsonError } from "@/lib/api-helpers";
import { d } from "@/lib/serializers";
import { pagoCreateSchema, pagoListQuery } from "@/lib/validation/pago";
import { listarPagosPorPrestamo, registrarPagoConCuota } from "@/services/pagoService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { response, session } = await getSessionOr401();
  if (response) return response;
  if (!session) return jsonError("No autorizado", 401);
  const prestamoId = req.nextUrl.searchParams.get("prestamoId");
  const q = pagoListQuery.safeParse({ prestamoId: prestamoId ?? "" });
  if (!q.success) {
    return jsonError("prestamoId requerido en query", 400);
  }
  const rows = await listarPagosPorPrestamo(q.data.prestamoId);
  return NextResponse.json(
    rows.map((p) => ({
      id: p.id,
      prestamoId: p.prestamoId,
      cuotaId: p.cuotaId,
      monto: d(p.monto),
      fechaPago: p.fechaPago,
      observacion: p.observacion,
      createdAt: p.createdAt,
      cuota: p.cuota
        ? {
            id: p.cuota.id,
            numero: p.cuota.numero,
            fechaVencimiento: p.cuota.fechaVencimiento,
            monto: d(p.cuota.monto),
            pagada: p.cuota.pagada,
          }
        : null,
    }))
  );
}

export async function POST(req: NextRequest) {
  const { response, session } = await getSessionOr401();
  if (response) return response;
  if (!session) return jsonError("No autorizado", 401);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Cuerpo JSON inválido", 400);
  }
  const parsed = pagoCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Validación", 400);
  }
  try {
    const p = await registrarPagoConCuota({
      cuotaId: parsed.data.cuotaId,
      fechaPago: parsed.data.fechaPago,
      observacion: parsed.data.observacion,
    });
    return NextResponse.json(
      {
        id: p.id,
        prestamoId: p.prestamoId,
        cuotaId: p.cuotaId,
        monto: d(p.monto),
        fechaPago: p.fechaPago,
        observacion: p.observacion,
        createdAt: p.createdAt,
      },
      { status: 201 }
    );
  } catch (e) {
    const m = e instanceof Error ? e.message : "Error al registrar pago";
    if (m.includes("no encontrada")) return jsonError(m, 404);
    if (m.includes("ya fue pagada")) return jsonError(m, 409);
    return jsonError(m, 500);
  }
}
