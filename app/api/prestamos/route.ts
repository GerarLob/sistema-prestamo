import { getSessionOr401, jsonError } from "@/lib/api-helpers";
import { d } from "@/lib/serializers";
import { prestamoCreateSchema } from "@/lib/validation/prestamo";
import { crearPrestamoConAmortizacion, listarPrestamos } from "@/services/prestamoService";
import { NextRequest, NextResponse } from "next/server";

function mapPrestamoList(p: Awaited<ReturnType<typeof listarPrestamos>>[number]) {
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
  };
}

export async function GET() {
  const { response, session } = await getSessionOr401();
  if (response) return response;
  if (!session) return jsonError("No autorizado", 401);
  const rows = await listarPrestamos();
  return NextResponse.json(rows.map(mapPrestamoList));
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
  const parsed = prestamoCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Validación", 400);
  }
  try {
    const p = await crearPrestamoConAmortizacion({
      ...parsed.data,
    });
    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (e) {
    const m = e instanceof Error ? e.message : "Error al crear";
    if (m.includes("Foreign key")) return jsonError("Cliente no existe", 400);
    return jsonError(m, 500);
  }
}
