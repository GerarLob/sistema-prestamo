import { prisma } from "@/lib/prisma";
import { d } from "@/lib/serializers";
import Link from "next/link";

export default async function PrestamosPage() {
  const rows = await prisma.prestamo.findMany({
    orderBy: { createdAt: "desc" },
    include: { cliente: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Préstamos</h1>
          <p className="text-sm text-slate-600">Cartera activa (últimos primero)</p>
        </div>
        <Link
          href="/prestamos/nuevo"
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Nuevo préstamo
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 font-medium">Cliente</th>
              <th className="p-3 font-medium">Monto</th>
              <th className="p-3 font-medium">Tasa a.</th>
              <th className="p-3 font-medium">Plazo</th>
              <th className="p-3 font-medium">Inicio</th>
              <th className="p-3 font-medium">Cuota / mes</th>
              <th className="p-3 font-medium">Tipo int.</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No hay préstamos.{" "}
                  <Link href="/prestamos/nuevo" className="text-sky-600 hover:underline">
                    Crear uno
                  </Link>
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0">
                  <td className="p-3">
                    <Link href={`/prestamos/${p.id}`} className="text-sky-600 hover:underline">
                      {p.cliente.nombre}
                    </Link>
                  </td>
                  <td className="p-3">Q{d(p.monto).toLocaleString("es-GT", { minimumFractionDigits: 2 })}</td>
                  <td className="p-3">{d(p.tasaAnual).toFixed(2)}%</td>
                  <td className="p-3">{p.plazoMeses} m</td>
                  <td className="p-3 text-slate-600">{p.fechaInicio.toLocaleDateString("es-GT")}</td>
                  <td className="p-3">Q{d(p.cuotaMensual).toLocaleString("es-GT", { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-xs">{p.tipoInteres}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
