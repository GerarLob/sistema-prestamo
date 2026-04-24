import { prisma } from "@/lib/prisma";
import { d } from "@/lib/serializers";
import { notFound } from "next/navigation";
import { CuotasTabla, PagosList } from "./ui";

type Props = { params: { id: string } };

export default async function PrestamoDetallePage({ params }: Props) {
  const p = await prisma.prestamo.findUnique({
    where: { id: params.id },
    include: {
      cliente: true,
      cuotas: { orderBy: { numero: "asc" } },
      pagos: { orderBy: { fechaPago: "desc" }, include: { cuota: true } },
    },
  });
  if (!p) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Préstamo — {p.cliente.nombre}</h1>
        <p className="text-sm text-slate-600">DPI {p.cliente.dpi}</p>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-slate-500">Monto: </span>
            <span>Q{d(p.monto).toLocaleString("es-GT", { minimumFractionDigits: 2 })}</span>
          </p>
          <p>
            <span className="text-slate-500">Tasa anual: </span>
            <span>{d(p.tasaAnual).toFixed(2)} %</span>
          </p>
          <p>
            <span className="text-slate-500">Plazo: </span>
            <span>{p.plazoMeses} meses</span>
          </p>
          <p>
            <span className="text-slate-500">Inicio: </span>
            <span>{p.fechaInicio.toLocaleDateString("es-GT")}</span>
          </p>
          <p>
            <span className="text-slate-500">Tipo: </span>
            <span>{p.tipoInteres}</span>
          </p>
          <p>
            <span className="text-slate-500">Cuota aprox. / mes: </span>
            <span>Q{d(p.cuotaMensual).toLocaleString("es-GT", { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Total a pagar: Q{d(p.totalAPagar).toLocaleString("es-GT", { minimumFractionDigits: 2 })} (interés: Q
          {d(p.totalInteres).toLocaleString("es-GT", { minimumFractionDigits: 2 })})
        </p>
      </div>
      <section>
        <h2 className="text-lg font-medium text-slate-900">Tabla de amortización / cuotas</h2>
        <CuotasTabla
          cuotas={p.cuotas.map((c) => ({
            id: c.id,
            numero: c.numero,
            fechaVencimiento: c.fechaVencimiento.toISOString(),
            capital: d(c.capital),
            interes: d(c.interes),
            monto: d(c.monto),
            pagada: c.pagada,
          }))}
        />
      </section>
      <section>
        <h2 className="text-lg font-medium text-slate-900">Historial de pagos</h2>
        <PagosList
          initial={p.pagos.map((pa) => ({
            id: pa.id,
            monto: d(pa.monto),
            fechaPago: pa.fechaPago.toISOString(),
            cuota: pa.cuota ? { numero: pa.cuota.numero } : null,
          }))}
        />
      </section>
    </div>
  );
}
