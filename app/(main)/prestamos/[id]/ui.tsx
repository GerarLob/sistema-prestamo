"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CuotaRow = {
  id: string;
  numero: number;
  fechaVencimiento: string;
  capital: number;
  interes: number;
  monto: number;
  pagada: boolean;
};

export function CuotasTabla({ cuotas }: { cuotas: CuotaRow[] }) {
  return (
    <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="p-2 font-medium">#</th>
            <th className="p-2 font-medium">Vencimiento</th>
            <th className="p-2 font-medium">Capital</th>
            <th className="p-2 font-medium">Interés</th>
            <th className="p-2 font-medium">Cuota</th>
            <th className="p-2 font-medium">Estado</th>
            <th className="p-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {cuotas.map((c) => (
            <tr key={c.id} className="border-b border-slate-100 last:border-0">
              <td className="p-2">{c.numero}</td>
              <td className="p-2 text-slate-600">{new Date(c.fechaVencimiento).toLocaleDateString("es-GT")}</td>
              <td className="p-2">Q{c.capital.toLocaleString("es-GT", { minimumFractionDigits: 2 })}</td>
              <td className="p-2">Q{c.interes.toLocaleString("es-GT", { minimumFractionDigits: 2 })}</td>
              <td className="p-2 font-medium">Q{c.monto.toLocaleString("es-GT", { minimumFractionDigits: 2 })}</td>
              <td className="p-2">
                {c.pagada ? (
                  <span className="text-green-700">Pagada</span>
                ) : (
                  <span className="text-amber-700">Pendiente</span>
                )}
              </td>
              <td className="p-2">
                {!c.pagada && <PagarUna fila={c} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PagarUna({ fila }: { fila: CuotaRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        if (!confirm(`Registrar pago de Q${fila.monto.toFixed(2)}?`)) return;
        setLoading(true);
        try {
          const res = await fetch("/api/pagos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cuotaId: fila.id, fechaPago: new Date().toISOString() }),
          });
          if (!res.ok) {
            const d = await res.json();
            alert(d.error ?? "Error");
            return;
          }
          const creado = (await res.json()) as { id: string };
          if (creado?.id) {
            window.open(`/recibo/${creado.id}?imprimir=1`, "_blank", "noopener,noreferrer");
          }
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
      className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-800 hover:bg-slate-50"
    >
      {loading ? "…" : "Pagar cuota"}
    </button>
  );
}

type PRow = { id: string; monto: number; fechaPago: string; cuota: { numero: number } | null };

export function PagosList({ initial }: { initial: PRow[] }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  async function anular(id: string) {
    if (!confirm("Anular pago? (solo admin)")) return;
    setErr(null);
    const res = await fetch(`/api/pagos/${id}`, { method: "DELETE" });
    if (res.status === 204) {
      router.refresh();
      return;
    }
    const d = await res.json();
    setErr(d.error ?? "Error");
  }

  return (
    <div className="mt-2">
      {err && <p className="text-sm text-red-600">{err}</p>}
      {initial.length === 0 ? (
        <p className="text-sm text-slate-500">Aún no hay pagos.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {initial.map((p) => (
            <li key={p.id} className="flex flex-col gap-2 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-slate-800">
                  Q{p.monto.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                </span>
                <span className="ml-2 text-slate-500">
                  {new Date(p.fechaPago).toLocaleString("es-GT")}{" "}
                  {p.cuota ? `· cuota #${p.cuota.numero}` : ""}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`/recibo/${p.id}`}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-slate-50"
                >
                  Ver recibo
                </a>
                {status === "authenticated" && session?.user?.role === "admin" && (
                  <button type="button" onClick={() => anular(p.id)} className="text-xs text-red-600 hover:underline">
                    Anular
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
