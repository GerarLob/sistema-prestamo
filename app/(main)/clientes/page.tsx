import { formatearDpi } from "@/lib/formatear-dpi";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function iconoDocumento(adjunto: boolean) {
  if (adjunto) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/80"
        title="Documento DPI adjunto"
      >
        <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        Archivo
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center text-xs text-slate-400"
      title="Sin documento en expediente"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V9.75a.75.75 0 0 0-.22-.53l-6.5-6.5a.75.75 0 0 0-.53-.22H9.75Z"
        />
      </svg>
    </span>
  );
}

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { prestamos: true } } },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-sky-400/10 text-blue-600 ring-1 ring-sky-200/60">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Clientes</h1>
            <p className="mt-0.5 text-sm text-slate-600 sm:text-base">
              Personas registradas, DPI y contacto. El expediente puede incluir copia del documento.
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-stretch sm:justify-end sm:gap-3">
          <a
            href="/api/clientes/export/pdf"
            className="inline-flex min-h-[2.75rem] shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50/90"
            title="Descargar listado en PDF"
          >
            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Descargar PDF
          </a>
          <Link
            href="/clientes/nuevo"
            className="btn-primary inline-flex w-full min-h-[2.75rem] shrink-0 items-center justify-center sm:w-auto"
          >
            <span className="mr-1.5 inline-block">+</span> Nuevo cliente
          </Link>
        </div>
      </div>

      {clientes.length === 0 ? (
        <div className="surface-liquid px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3M9 3.75H5.25A2.25 2.25 0 0 0 3 6v9a2.25 2.25 0 0 0 2.25 2.25h.75A2.25 2.25 0 0 0 9.75 20.25H15a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 15 3.75H9Z"
              />
            </svg>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-800">Aún no hay clientes</p>
          <p className="mt-1 text-sm text-slate-600">Crea el primero para asociar préstamos y pagos.</p>
          <Link href="/clientes/nuevo" className="link-muted mt-4 inline-block text-sm font-medium">
            Registrar cliente
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {clientes.map((c) => (
              <div
                key={c.id}
                className="surface-liquid p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium leading-snug text-slate-900">{c.nombre}</p>
                    <p className="mt-1 font-mono text-xs tabular-nums text-slate-600">{formatearDpi(c.dpi)}</p>
                  </div>
                  <Link
                    href={`/clientes/${c.id}`}
                    className="shrink-0 rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm"
                  >
                    Editar
                  </Link>
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="shrink-0 text-slate-500">Teléfono</dt>
                    <dd className="min-w-0 text-right text-slate-800">{c.telefono?.trim() || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="shrink-0 text-slate-500">Dirección</dt>
                    <dd className="min-w-0 text-right text-slate-700">{c.direccion?.trim() || "—"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-slate-200/60 pt-2">
                    <span className="text-slate-500">DPI (archivo)</span>
                    {iconoDocumento(!!c.dpiDocumentoUrl)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Préstamos</span>
                    <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-900">
                      {c._count.prestamos}
                    </span>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl md:block">
            <div className="surface-liquid overflow-x-auto p-0">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-sky-200/40 bg-gradient-to-r from-slate-50/80 to-sky-50/40 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3.5 pl-5 sm:pl-6">Cliente</th>
                    <th className="px-4 py-3.5">DPI</th>
                    <th className="px-4 py-3.5">Expediente</th>
                    <th className="px-4 py-3.5">Teléfono</th>
                    <th className="px-4 py-3.5 min-w-[12rem]">Dirección</th>
                    <th className="px-4 py-3.5 text-center w-24">Préstamos</th>
                    <th className="px-4 py-3.5 pr-5 sm:pr-6 w-28" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {clientes.map((c) => (
                    <tr
                      key={c.id}
                      className="bg-white/40 transition hover:bg-sky-50/50"
                    >
                      <td className="px-4 py-3.5 pl-5 sm:pl-6">
                        <span className="font-medium text-slate-900">{c.nombre}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="font-mono text-sm tabular-nums text-slate-700"
                          title={c.dpi}
                        >
                          {formatearDpi(c.dpi)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-middle">{iconoDocumento(!!c.dpiDocumentoUrl)}</td>
                      <td className="px-4 py-3.5 text-slate-700">{c.telefono?.trim() || "—"}</td>
                      <td
                        className="max-w-xs px-4 py-3.5 text-slate-600"
                        title={c.direccion?.trim() || undefined}
                      >
                        <span className="line-clamp-2 min-w-0 break-words">{c.direccion?.trim() || "—"}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className="inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-sky-100/90 px-2.5 py-0.5 text-xs font-semibold text-sky-900"
                          title="Préstamos activos o históricos"
                        >
                          {c._count.prestamos}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 pr-5 text-right sm:pr-6">
                        <Link
                          href={`/clientes/${c.id}`}
                          className="inline-flex rounded-lg border border-blue-200/80 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/80"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
