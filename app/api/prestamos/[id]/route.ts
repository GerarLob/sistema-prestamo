import { getSessionOr401, jsonError } from "@/lib/api-helpers";
import { d } from "@/lib/serializers";
import { eliminarPrestamo, findPrestamoById } from "@/services/prestamoService";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: { id: string } };

function serialize(p: NonNullable<Awaited<ReturnType<typeof findPrestamoById>>>) {
  return {
    id: p.id,
    clienteId: p.clienteId,
    monto: d(p.monto),
    tasaAnual: d(p.tasaAnual),
    plazoMeses: p.plazoMeses,
    fechaInicio: p.fechaInicio,
    tipoInteres: p.tipoInteres,
    cuotaMensual: d(p.cuotaMensual),
    totalInteres: d(p.totalInteres),
    totalAPagar: d(p.totalAPagar),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    cliente: p.cliente,
    cuotas: p.cuotas.map((c) => ({
      id: c.id,
      prestamoId: c.prestamoId,
      numero: c.numero,
      fechaVencimiento: c.fechaVencimiento,
      capital: d(c.capital),
      interes: d(c.interes),
      monto: d(c.monto),
      pagada: c.pagada,
    })),
    pagos: p.pagos.map((pa) => ({
      id: pa.id,
      prestamoId: pa.prestamoId,
      cuotaId: pa.cuotaId,
      monto: d(pa.monto),
      fechaPago: pa.fechaPago,
      observacion: pa.observacion,
      createdAt: pa.createdAt,
    })),
  };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { response, session } = await getSessionOr401();
  if (response) return response;
  if (!session) return jsonError("No autorizado", 401);
  const p = await findPrestamoById(params.id);
  if (!p) return jsonError("No encontrado", 404);
  return NextResponse.json(serialize(p));
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { response, session } = await getSessionOr401();
  if (response) return response;
  if (!session) return jsonError("No autorizado", 401);
  try {
    await eliminarPrestamo(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const m = e instanceof Error ? e.message : "";
    if (m.includes("not found") || m.includes("Record to delete")) {
      return jsonError("No encontrado", 404);
    }
    return jsonError(m || "Error", 500);
  }
}
