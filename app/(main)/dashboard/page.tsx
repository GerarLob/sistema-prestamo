import { prisma } from "@/lib/prisma";
import { d } from "@/lib/serializers";
import Link from "next/link";

export default async function DashboardPage() {
  const [nClientes, nPrestamos, totalPrestado] = await Promise.all([
    prisma.cliente.count(),
    prisma.prestamo.count(),
    prisma.prestamo.aggregate({ _sum: { monto: true } }),
  ]);
  const sumMonto = d(totalPrestado._sum.monto) ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">Panel</h1>
        <p className="mt-0.5 text-sm text-slate-600 sm:text-base">Resumen del sistema de préstamos</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        <div className="surface-liquid p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Clientes</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{nClientes}</p>
          <Link href="/clientes" className="link-muted mt-2 inline-block text-sm font-medium">
            Gestionar
          </Link>
        </div>
        <div className="surface-liquid p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Préstamos</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{nPrestamos}</p>
        </div>
        <div className="surface-liquid col-span-1 sm:col-span-2 xl:col-span-1 p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 sm:text-sm">
            Cartera (principal desembolsado)
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
            Q{sumMonto.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
