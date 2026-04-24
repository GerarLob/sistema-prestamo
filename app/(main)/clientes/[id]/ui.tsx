"use client";

import { Cliente } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif";

function esImagenDpiUrl(url: string) {
  return /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(url);
}

export function EditarClienteForm({ cliente }: { cliente: Cliente }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [quitarDoc, setQuitarDoc] = useState(false);

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
    if (quitarDoc) {
      fd.delete("dpiDocumento");
      fd.set("eliminarDocumento", "1");
    } else {
      fd.delete("eliminarDocumento");
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, {
        method: "PUT",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Error al guardar");
        return;
      }
      setArchivo(null);
      setQuitarDoc(false);
      router.refresh();
    } catch {
      setErr("Error de red");
    } finally {
      setSaving(false);
    }
  }

  async function eliminar() {
    if (!confirm("¿Eliminar este cliente? (solo si no tiene préstamos)")) return;
    const res = await fetch(`/api/clientes/${cliente.id}`, { method: "DELETE" });
    if (res.status === 204) {
      router.push("/clientes");
      return;
    }
    const data = await res.json();
    alert(data.error ?? "No se pudo eliminar");
  }

  const doc = cliente.dpiDocumentoUrl;
  const mostrarFichaDoc = doc && !quitarDoc;

  return (
    <div className="space-y-6">
      {mostrarFichaDoc && (
        <div className="surface-liquid p-4 sm:p-5">
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">Documento de identidad (DPI)</h2>
          <div className="mt-3 space-y-3">
            {esImagenDpiUrl(doc) ? (
              <a
                href={doc}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50"
              >
                <img src={doc} alt="Vista del DPI" className="max-h-64 w-full object-contain" />
              </a>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <a
                href={doc}
                target="_blank"
                rel="noreferrer"
                className="btn-primary !min-h-0 !py-2 !text-xs"
              >
                {/\.pdf$/i.test(doc) ? "Abrir PDF" : "Abrir archivo"}
              </a>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 surface-liquid p-4 sm:p-6">
        {err && <p className="text-sm text-red-600">{err}</p>}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Nombre</label>
          <input
            name="nombre"
            required
            defaultValue={cliente.nombre}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">DPI</label>
          <input name="dpi" required defaultValue={cliente.dpi} className="input-field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Teléfono</label>
          <input
            name="telefono"
            defaultValue={cliente.telefono ?? ""}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Dirección</label>
          <input
            name="direccion"
            defaultValue={cliente.direccion ?? ""}
            className="input-field"
          />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            {mostrarFichaDoc
              ? "Puedes reemplazar el archivo o quitarlo del expediente."
              : "Puedes adjuntar un PDF o una foto del DPI (opcional)."}
          </p>
          <input
            name="dpiDocumento"
            type="file"
            accept={ACCEPT}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-800"
            onChange={(ev) => {
              const f = ev.target.files?.[0] ?? null;
              setArchivo(f);
              if (f) setQuitarDoc(false);
            }}
          />
          {archivo && vistaPrevia && (
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200/80">
              <img src={vistaPrevia} alt="Vista previa" className="max-h-48 w-full object-contain" />
            </div>
          )}
          {archivo?.type === "application/pdf" && (
            <p className="text-xs text-slate-600">Nuevo PDF seleccionado: {archivo.name}</p>
          )}
          {mostrarFichaDoc && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={quitarDoc}
                onChange={(e) => {
                  setQuitarDoc(e.target.checked);
                  if (e.target.checked) setArchivo(null);
                }}
              />
              Quitar documento del expediente
            </label>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex-1 sm:flex-none">
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <button
            type="button"
            onClick={eliminar}
            className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-2.5 text-sm font-medium text-red-800"
          >
            Eliminar cliente
          </button>
        </div>
        <p className="text-xs text-slate-500">
          <Link href={`/prestamos/nuevo?clienteId=${cliente.id}`} className="link-muted text-sm">
            Crear préstamo para este cliente
          </Link>
        </p>
      </form>
    </div>
  );
}
