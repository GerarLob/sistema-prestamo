"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif";

export default function NuevoClientePage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);

  useEffect(() => {
    if (!archivo || !archivo.type.startsWith("image/")) {
      setVistaPrevia((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }
    const u = URL.createObjectURL(archivo);
    setVistaPrevia((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return u;
    });
    return () => {
      URL.revokeObjectURL(u);
    };
  }, [archivo]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Error al guardar");
        return;
      }
      router.push(`/clientes/${data.id}`);
    } catch {
      setErr("Error de red");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-sky-400/10 text-blue-600 ring-1 ring-sky-200/60">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Nuevo cliente</h1>
              <p className="text-sm text-slate-600">Registra los datos y, si quieres, adjunta una foto o PDF del DPI.</p>
            </div>
          </div>
        </div>
        <Link href="/clientes" className="text-sm link-muted w-fit self-start sm:self-center">
          ← Volver a clientes
        </Link>
      </div>

      <form onSubmit={onSubmit} className="surface-liquid space-y-6 p-6 sm:p-8">
        {err && (
          <p className="rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-800" role="alert">
            {err}
          </p>
        )}

        <div className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">Datos personales</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nombre completo</label>
              <input
                name="nombre"
                required
                autoComplete="name"
                className="input-field"
                placeholder="Ej. María Pérez López"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">DPI</label>
              <input name="dpi" required className="input-field" placeholder="Número de identificación" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Teléfono</label>
              <input
                name="telefono"
                type="tel"
                className="input-field"
                placeholder="Opcional"
                autoComplete="tel"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Dirección</label>
              <input name="direccion" className="input-field" placeholder="Opcional" autoComplete="street-address" />
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        <div className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">Documento de identidad (DPI)</h2>
          <p className="text-sm text-slate-600">
            Puedes subir un PDF o una imagen nítida (JPG, PNG, etc.). Tamaño máximo 8 MB. Es opcional, pero mejora el expediente
            del cliente.
          </p>
          <label className="group flex cursor-pointer flex-col gap-3 rounded-2xl border-2 border-dashed border-sky-300/70 bg-white/50 px-4 py-6 transition hover:border-blue-400/80 hover:bg-white/80">
            <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-800">Arrastra o haz clic para elegir archivo</span>
                <p className="mt-0.5 text-xs text-slate-500">PDF, JPG, PNG, WebP — hasta 8 MB</p>
              </div>
            </div>
            <input
              name="dpiDocumento"
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(ev) => {
                const f = ev.target.files?.[0];
                setArchivo(f ?? null);
              }}
            />
            {archivo && (
              <p className="text-center text-sm text-slate-700 sm:text-left">
                <span className="font-medium">Seleccionado:</span> {archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)
              </p>
            )}
            {vistaPrevia && (
              <div className="mt-1 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50">
                <img src={vistaPrevia} alt="Vista previa del DPI" className="max-h-56 w-full object-contain" />
              </div>
            )}
            {archivo && archivo.type === "application/pdf" && (
              <p className="text-center text-sm text-amber-800 sm:text-left">
                PDF listo para enviarse. No hay vista previa en el navegador.
              </p>
            )}
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/clientes"
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className="btn-primary w-full min-w-[10rem] sm:w-auto">
            {saving ? "Creando…" : "Crear cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}
