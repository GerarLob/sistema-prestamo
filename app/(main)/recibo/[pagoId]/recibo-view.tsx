"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export type ReciboData = {
  reciboId: string;
  fechaPago: string;
  monto: number;
  capital: number;
  interes: number;
  cuotaNumero: number;
  cuotaFechaVenc: string;
  prestamoId: string;
  clienteNombre: string;
  clienteDpi: string;
  clienteTelefono: string | null;
  clienteDireccion: string | null;
  observacion: string | null;
  generadoEn: string;
  empresaNombre: string;
};

const fmtQ = (n: number) =>
  `Q${n.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleString("es-GT", { dateStyle: "long", timeStyle: "short" });

function ReciboCuerpo({ data }: { data: ReciboData }) {
  return (
    <article className="recibo-papel mx-auto max-w-lg rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg print:max-w-none print:rounded-none print:border-0 print:shadow-none sm:p-8">
      <header className="border-b border-slate-200 pb-4 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Recibo de pago</p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">{data.empresaNombre}</h1>
        <p className="mt-2 font-mono text-xs text-slate-600">No. {data.reciboId}</p>
      </header>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
          <dt className="text-slate-500">Fecha y hora de pago</dt>
          <dd className="text-right text-slate-900">{fmtFecha(data.fechaPago)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
          <dt className="text-slate-500">Cliente</dt>
          <dd className="text-right font-medium text-slate-900">{data.clienteNombre}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
          <dt className="text-slate-500">DPI</dt>
          <dd className="text-right text-slate-800">{data.clienteDpi}</dd>
        </div>
        {data.clienteTelefono && (
          <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">Teléfono</dt>
            <dd className="text-right text-slate-800">{data.clienteTelefono}</dd>
          </div>
        )}
        {data.clienteDireccion && (
          <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
            <dt className="text-slate-500">Dirección</dt>
            <dd className="text-right text-slate-800">{data.clienteDireccion}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
          <dt className="text-slate-500">Préstamo</dt>
          <dd className="font-mono text-right text-xs text-slate-800">{data.prestamoId}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
          <dt className="text-slate-500">Cuota n.º</dt>
          <dd className="text-right text-slate-900">{data.cuotaNumero}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
          <dt className="text-slate-500">Vencimiento cuota</dt>
          <dd className="text-right text-slate-800">
            {new Date(data.cuotaFechaVenc).toLocaleDateString("es-GT")}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
          <dt className="text-slate-500">Capital</dt>
          <dd className="text-right tabular-nums text-slate-800">{fmtQ(data.capital)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-slate-100 py-1.5">
          <dt className="text-slate-500">Interés</dt>
          <dd className="text-right tabular-nums text-slate-800">{fmtQ(data.interes)}</dd>
        </div>
        {data.observacion && (
          <div className="py-1.5">
            <dt className="text-slate-500">Observación</dt>
            <dd className="mt-0.5 text-slate-800">{data.observacion}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center print:border print:border-slate-200 print:bg-white">
        <p className="text-xs text-slate-500">Monto recibido</p>
        <p className="text-2xl font-semibold tabular-nums text-slate-900 sm:text-3xl">{fmtQ(data.monto)}</p>
        <p className="mt-1 text-xs text-slate-400">Quetzales (GTQ)</p>
      </div>

      <footer className="mt-6 border-t border-slate-200 pt-4 text-center text-[10px] text-slate-400">
        <p>Documento generado el {new Date(data.generadoEn).toLocaleString("es-GT")}</p>
        <p className="mt-0.5">Conserve este recibo como comprobante de pago.</p>
      </footer>
    </article>
  );
}

export function ReciboView({ data, prestamoPath }: { data: ReciboData; prestamoPath: string }) {
  const q = useSearchParams();
  const didAutoPrint = useRef(false);
  const imprimir = q.get("imprimir") === "1";

  useEffect(() => {
    if (!imprimir || didAutoPrint.current) return;
    didAutoPrint.current = true;
    const t = setTimeout(() => window.print(), 300);
    return () => clearTimeout(t);
  }, [imprimir]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link
          href={prestamoPath}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          ← Volver al préstamo
        </Link>
        <button type="button" onClick={() => window.print()} className="btn-primary px-4 py-2 text-sm">
          Imprimir recibo
        </button>
      </div>
      <ReciboCuerpo data={data} />
    </>
  );
}
