"use client";

import type { TipoInteres } from "@/lib/enums";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type C = { id: string; nombre: string; dpi: string };

export function NuevoPrestamoForm({
  clientes,
  defaultClienteId,
}: {
  clientes: C[];
  defaultClienteId: string;
}) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const fecha = String(fd.get("fechaInicio") || "");
    const body = {
      clienteId: String(fd.get("clienteId") || ""),
      monto: Number(fd.get("monto")),
      tasaAnual: Number(fd.get("tasaAnual")),
      plazoMeses: Number(fd.get("plazoMeses")),
      fechaInicio: new Date(fecha).toISOString(),
      tipoInteres: String(fd.get("tipoInteres")) as TipoInteres,
    };
    if (!body.clienteId) {
      setErr("Elige un cliente");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/prestamos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Error al crear");
        return;
      }
      router.push(`/prestamos/${data.id}`);
    } catch {
      setErr("Error de red");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div>
        <label className="text-xs text-slate-500">Cliente</label>
        <select
          name="clienteId"
          required
          defaultValue={defaultClienteId}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
        >
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} — {c.dpi}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-500">Monto (Q)</label>
        <input
          name="monto"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500">Tasa de interés anual (%)</label>
        <input
          name="tasaAnual"
          type="number"
          step="0.0001"
          min="0"
          max="100"
          required
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500">Plazo (meses)</label>
        <input
          name="plazoMeses"
          type="number"
          min={1}
          max={600}
          required
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
        />
      </div>
      <div>
        <label className="text-xs text-slate-500">Fecha de inicio</label>
        <input name="fechaInicio" type="date" required className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5" />
      </div>
      <div>
        <label className="text-xs text-slate-500">Tipo de interés</label>
        <select
          name="tipoInteres"
          defaultValue="COMPUESTO"
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5"
        >
          <option value="COMPUESTO">Compuesto (cuota fija, saldo de capital)</option>
          <option value="SIMPLE">Simple (lineal por periodo)</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Creando…" : "Crear préstamo y cuotas"}
      </button>
    </form>
  );
}
