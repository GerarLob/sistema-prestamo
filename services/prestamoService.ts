import { prisma } from "@/lib/prisma";
import type { TipoInteres } from "@/lib/enums";
import { aDecimal, generarAmortizacion } from "./amortizacion";

export type CrearPrestamoInput = {
  clienteId: string;
  monto: number;
  tasaAnual: number;
  plazoMeses: number;
  fechaInicio: Date;
  tipoInteres: TipoInteres;
};

export async function crearPrestamoConAmortizacion(data: CrearPrestamoInput) {
  const { filas, cuotaMensual, totalInteres, totalAPagar } = generarAmortizacion(
    data.monto,
    data.tasaAnual,
    data.plazoMeses,
    data.fechaInicio,
    data.tipoInteres
  );

  return prisma.$transaction(async (tx) => {
    const prestamo = await tx.prestamo.create({
      data: {
        clienteId: data.clienteId,
        monto: aDecimal(data.monto),
        tasaAnual: aDecimal(data.tasaAnual),
        plazoMeses: data.plazoMeses,
        fechaInicio: data.fechaInicio,
        tipoInteres: data.tipoInteres,
        cuotaMensual: aDecimal(cuotaMensual),
        totalInteres: aDecimal(totalInteres),
        totalAPagar: aDecimal(totalAPagar),
      },
    });

    for (const f of filas) {
      await tx.cuota.create({
        data: {
          prestamoId: prestamo.id,
          numero: f.numero,
          fechaVencimiento: f.fechaVencimiento,
          capital: aDecimal(f.capital),
          interes: aDecimal(f.interes),
          monto: aDecimal(f.monto),
        },
      });
    }

    return tx.prestamo.findUniqueOrThrow({
      where: { id: prestamo.id },
      include: {
        cliente: true,
        cuotas: { orderBy: { numero: "asc" } },
        pagos: { orderBy: { fechaPago: "desc" } },
      },
    });
  });
}

export async function findPrestamoById(id: string) {
  return prisma.prestamo.findUnique({
    where: { id },
    include: {
      cliente: true,
      cuotas: { orderBy: { numero: "asc" } },
      pagos: { orderBy: { fechaPago: "desc" }, include: { cuota: true } },
    },
  });
}

export async function listarPrestamos() {
  return prisma.prestamo.findMany({
    orderBy: { createdAt: "desc" },
    include: { cliente: true },
  });
}

export async function eliminarPrestamo(id: string) {
  return prisma.prestamo.delete({ where: { id } });
}
