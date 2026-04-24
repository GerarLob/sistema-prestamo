import type { TipoInteres } from "@/lib/enums";
import { Prisma } from "@prisma/client";

export type FilaAmortizacion = {
  numero: number;
  fechaVencimiento: Date;
  capital: number;
  interes: number;
  monto: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Compuesto: sistema francés, cuota fija, interés compuesto (sobre saldo; tasa anual → tasa mensual = anual/12/100).
 * Es el cálculo típico bancario de préstamos a plazo fijo.
 */
function generarCompuesto(
  monto: number,
  tasaAnualPorcentual: number,
  plazoMeses: number,
  fechaInicio: Date
): { filas: FilaAmortizacion[]; cuotaMensual: number; totalInteres: number; totalAPagar: number } {
  const t = tasaAnualPorcentual / 100 / 12;
  let pmt: number;
  if (t <= 0) pmt = round2(monto / plazoMeses);
  else pmt = round2((monto * t * Math.pow(1 + t, plazoMeses)) / (Math.pow(1 + t, plazoMeses) - 1));

  const filas: FilaAmortizacion[] = [];
  let saldo = round2(monto);

  for (let i = 1; i <= plazoMeses; i++) {
    const isLast = i === plazoMeses;
    const interes = round2(saldo * t);
    const capital = isLast ? saldo : round2(pmt - interes);
    const cuotaMonto = round2(interes + capital);
    const fv = addMonths(fechaInicio, i);
    filas.push({ numero: i, fechaVencimiento: fv, capital, interes, monto: cuotaMonto });
    saldo = round2(saldo - capital);
  }

  const totalAPagar = round2(filas.reduce((s, f) => s + f.monto, 0));
  const totalInteres = round2(totalAPagar - monto);
  return { filas, cuotaMensual: plazoMeses > 0 ? filas[0].monto : 0, totalInteres, totalAPagar };
}

/**
 * Simple: interés lineal I_total = P × (tasa_anual/100) × (plazo_meses/12).
 * Cuota constante: capital/ n + (I_total/ n) por periodo. No capitaliza el interés en el saldo.
 */
function generarSimple(
  monto: number,
  tasaAnualPorcentual: number,
  plazoMeses: number,
  fechaInicio: Date
): { filas: FilaAmortizacion[]; cuotaMensual: number; totalInteres: number; totalAPagar: number } {
  const anios = plazoMeses / 12;
  const I_total = round2(monto * (tasaAnualPorcentual / 100) * anios);
  const K = plazoMeses > 0 ? round2(monto / plazoMeses) : 0;
  const I_por = plazoMeses > 0 ? round2(I_total / plazoMeses) : 0;
  const pmt = round2(K + I_por);
  const filas: FilaAmortizacion[] = [];
  for (let i = 1; i <= plazoMeses; i++) {
    const fv = addMonths(fechaInicio, i);
    const esUltima = i === plazoMeses;
    const capital = esUltima ? round2(monto - K * (plazoMeses - 1)) : K;
    const interes = esUltima ? round2(pmt - capital) : I_por;
    const cuotaMonto = esUltima ? round2(capital + interes) : pmt;
    filas.push({ numero: i, fechaVencimiento: fv, capital, interes, monto: cuotaMonto });
  }
  const totalAPagar = round2(filas.reduce((s, f) => s + f.monto, 0));
  const totalInteres = round2(totalAPagar - monto);
  return { filas, cuotaMensual: plazoMeses > 0 ? pmt : 0, totalInteres, totalAPagar };
}

function addMonths(d: Date, add: number) {
  const x = new Date(d.getTime());
  const day = x.getDate();
  x.setMonth(x.getMonth() + add);
  if (x.getDate() < day) x.setDate(0);
  return x;
}

export function generarAmortizacion(
  monto: number,
  tasaAnualPorcentual: number,
  plazoMeses: number,
  fechaInicio: Date,
  tipo: TipoInteres
) {
  if (monto <= 0) throw new Error("El monto debe ser mayor a 0");
  if (plazoMeses <= 0) throw new Error("El plazo en meses debe ser mayor a 0");
  if (tasaAnualPorcentual < 0) throw new Error("La tasa no puede ser negativa");

  if (tipo === "COMPUESTO") {
    return generarCompuesto(monto, tasaAnualPorcentual, plazoMeses, fechaInicio);
  }
  return generarSimple(monto, tasaAnualPorcentual, plazoMeses, fechaInicio);
}

export function aDecimal(n: number): Prisma.Decimal {
  return new Prisma.Decimal(n.toFixed(2));
}
