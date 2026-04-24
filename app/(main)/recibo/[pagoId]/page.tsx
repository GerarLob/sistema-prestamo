import { obtenerPagoParaRecibo } from "@/services/pagoService";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ReciboData, ReciboView } from "./recibo-view";

type Props = { params: { pagoId: string } };

export const metadata: Metadata = {
  title: "Recibo de pago",
  robots: { index: false, follow: false },
};

function toReciboData(p: NonNullable<Awaited<ReturnType<typeof obtenerPagoParaRecibo>>>): ReciboData {
  return {
    reciboId: p.id,
    fechaPago: p.fechaPago.toISOString(),
    monto: p.monto,
    capital: p.cuota.capital,
    interes: p.cuota.interes,
    cuotaNumero: p.cuota.numero,
    cuotaFechaVenc: p.cuota.fechaVencimiento.toISOString(),
    prestamoId: p.prestamo.id,
    clienteNombre: p.cliente.nombre,
    clienteDpi: p.cliente.dpi,
    clienteTelefono: p.cliente.telefono,
    clienteDireccion: p.cliente.direccion,
    observacion: p.observacion,
    generadoEn: new Date().toISOString(),
    empresaNombre: process.env.NEXT_PUBLIC_NOMBRE_EMPRESA?.trim() || "Sistema de préstamos",
  };
}

export default async function ReciboPagoPage({ params }: Props) {
  const p = await obtenerPagoParaRecibo(params.pagoId);
  if (!p) notFound();
  const data = toReciboData(p);
  return (
    <div className="print:bg-white print:pt-0">
      <Suspense fallback={<p className="text-slate-500">Cargando…</p>}>
        <ReciboView data={data} prestamoPath={`/prestamos/${p.prestamo.id}`} />
      </Suspense>
    </div>
  );
}
