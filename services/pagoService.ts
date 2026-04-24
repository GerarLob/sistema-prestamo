import { prisma } from "@/lib/prisma";
import { aDecimal } from "./amortizacion";
import { d } from "@/lib/serializers";

export type RegistrarPagoInput = {
  cuotaId: string;
  fechaPago?: Date;
  observacion?: string;
};

/**
 * Crea un pago por el monto de la cuota (total) y marca la cuota como pagada.
 */
export async function registrarPagoConCuota(input: RegistrarPagoInput) {
  return prisma.$transaction(async (tx) => {
    const cuota = await tx.cuota.findUnique({
      where: { id: input.cuotaId },
      include: { pago: true, prestamo: true },
    });
    if (!cuota) throw new Error("Cuota no encontrada");
    if (cuota.pagada || cuota.pago) {
      throw new Error("Esta cuota ya fue pagada");
    }

    const monto = Number(cuota.monto);

    const pago = await tx.pago.create({
      data: {
        prestamoId: cuota.prestamoId,
        cuotaId: cuota.id,
        monto: aDecimal(monto),
        fechaPago: input.fechaPago ?? new Date(),
        observacion: input.observacion?.trim() || null,
      },
    });

    await tx.cuota.update({
      where: { id: cuota.id },
      data: { pagada: true },
    });

    return pago;
  });
}

export async function listarPagosPorPrestamo(prestamoId: string) {
  return prisma.pago.findMany({
    where: { prestamoId },
    orderBy: { fechaPago: "desc" },
    include: { cuota: true },
  });
}

export type PagoReciboDetalle = {
  id: string;
  monto: number;
  fechaPago: Date;
  observacion: string | null;
  createdAt: Date;
  cuota: {
    numero: number;
    fechaVencimiento: Date;
    capital: number;
    interes: number;
    monto: number;
  };
  prestamo: {
    id: string;
    monto: number;
    tasaAnual: number;
    plazoMeses: number;
    tipoInteres: string;
  };
  cliente: { nombre: string; dpi: string; telefono: string | null; direccion: string | null };
};

export async function obtenerPagoParaRecibo(pagoId: string): Promise<PagoReciboDetalle | null> {
  const p = await prisma.pago.findUnique({
    where: { id: pagoId },
    include: {
      cuota: true,
      prestamo: { include: { cliente: true } },
    },
  });
  if (!p || !p.cuota) return null;
  return {
    id: p.id,
    monto: d(p.monto),
    fechaPago: p.fechaPago,
    observacion: p.observacion,
    createdAt: p.createdAt,
    cuota: {
      numero: p.cuota.numero,
      fechaVencimiento: p.cuota.fechaVencimiento,
      capital: d(p.cuota.capital),
      interes: d(p.cuota.interes),
      monto: d(p.cuota.monto),
    },
    prestamo: {
      id: p.prestamo.id,
      monto: d(p.prestamo.monto),
      tasaAnual: d(p.prestamo.tasaAnual),
      plazoMeses: p.prestamo.plazoMeses,
      tipoInteres: p.prestamo.tipoInteres,
    },
    cliente: {
      nombre: p.prestamo.cliente.nombre,
      dpi: p.prestamo.cliente.dpi,
      telefono: p.prestamo.cliente.telefono,
      direccion: p.prestamo.cliente.direccion,
    },
  };
}

export async function eliminarPago(pagoId: string) {
  return prisma.$transaction(async (tx) => {
    const pago = await tx.pago.findUnique({ where: { id: pagoId }, include: { cuota: true } });
    if (!pago) throw new Error("Pago no encontrado");

    if (pago.cuotaId) {
      await tx.cuota.update({
        where: { id: pago.cuotaId },
        data: { pagada: false },
      });
    }

    return tx.pago.delete({ where: { id: pagoId } });
  });
}
