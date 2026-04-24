import { getSessionOr401, jsonError } from "@/lib/api-helpers";
import { eliminarArchivoDisco, guardarArchivoDpi } from "@/lib/dpi-upload";
import { clienteCreateSchema } from "@/lib/validation/cliente";
import { crearCliente, listarClientes } from "@/services/clienteService";
import { NextRequest, NextResponse } from "next/server";

function leerFormCliente(form: FormData) {
  return {
    nombre: String(form.get("nombre") ?? ""),
    dpi: String(form.get("dpi") ?? ""),
    telefono: (form.get("telefono") as string) || null,
    direccion: (form.get("direccion") as string) || null,
    file: (() => {
      const f = form.get("dpiDocumento");
      return f instanceof File && f.size > 0 ? f : null;
    })(),
  };
}

export async function GET() {
  const { session, response } = await getSessionOr401();
  if (response) return response;
  if (!session) return jsonError("No autorizado", 401);
  try {
    const rows = await listarClientes();
    return NextResponse.json(rows);
  } catch (e) {
    const m = e instanceof Error ? e.message : "Error al listar";
    return jsonError(m, 500);
  }
}

export async function POST(req: NextRequest) {
  const { session, response } = await getSessionOr401();
  if (response) return response;
  if (!session) return jsonError("No autorizado", 401);

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const { file, ...fields } = leerFormCliente(form);
    const parsed = clienteCreateSchema.safeParse(fields);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Validación", 400);
    }
    let dpiDocumentoUrl: string | null = null;
    if (file) {
      try {
        dpiDocumentoUrl = await guardarArchivoDpi(file);
      } catch (err) {
        return jsonError(err instanceof Error ? err.message : "Archivo no válido", 400);
      }
    }
    try {
      const c = await crearCliente({ ...parsed.data, dpiDocumentoUrl });
      return NextResponse.json(c, { status: 201 });
    } catch (e) {
      if (dpiDocumentoUrl) await eliminarArchivoDisco(dpiDocumentoUrl);
      const m = e instanceof Error ? e.message : "Error al crear";
      if (m.includes("Unique")) return jsonError("DPI duplicado", 409);
      return jsonError(m, 500);
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Cuerpo JSON inválido", 400);
  }
  const parsed = clienteCreateSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Validación";
    return jsonError(msg, 400);
  }
  try {
    const c = await crearCliente(parsed.data);
    return NextResponse.json(c, { status: 201 });
  } catch (e) {
    const m = e instanceof Error ? e.message : "Error al crear";
    if (m.includes("Unique")) return jsonError("DPI duplicado", 409);
    return jsonError(m, 500);
  }
}
