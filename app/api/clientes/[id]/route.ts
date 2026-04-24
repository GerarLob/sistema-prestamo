import { getSessionOr401, jsonError } from "@/lib/api-helpers";
import { eliminarArchivoDisco, guardarArchivoDpi } from "@/lib/dpi-upload";
import { clienteCreateSchema } from "@/lib/validation/cliente";
import {
  actualizarCliente,
  eliminarCliente,
  obtenerCliente,
} from "@/services/clienteService";
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
type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const { session, response } = await getSessionOr401();
  if (response) return response;
  if (!session) return jsonError("No autorizado", 401);
  const id = params.id;
  if (!id) return jsonError("ID requerido", 400);
  const c = await obtenerCliente(id);
  if (!c) return jsonError("No encontrado", 404);
  return NextResponse.json(c);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { session, response } = await getSessionOr401();
  if (response) return response;
  if (!session) return jsonError("No autorizado", 401);
  const id = params.id;
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const eliminarDocumento = String(form.get("eliminarDocumento") ?? "") === "1";
    const { file, ...fields } = leerFormCliente(form);
    const parsed = clienteCreateSchema.safeParse(fields);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message ?? "Validación", 400);
    }
    const anterior = await obtenerCliente(id);
    if (!anterior) return jsonError("No encontrado", 404);

    if (file) {
      let nuevo: string | null = null;
      try {
        nuevo = await guardarArchivoDpi(file);
      } catch (err) {
        return jsonError(err instanceof Error ? err.message : "Archivo no válido", 400);
      }
      try {
        const c = await actualizarCliente(id, { ...parsed.data, dpiDocumentoUrl: nuevo });
        if (anterior.dpiDocumentoUrl) await eliminarArchivoDisco(anterior.dpiDocumentoUrl);
        return NextResponse.json(c);
      } catch (e) {
        if (nuevo) await eliminarArchivoDisco(nuevo);
        const m = e instanceof Error ? e.message : "Error";
        if (m.includes("Record to update not found")) return jsonError("No encontrado", 404);
        if (m.includes("Unique")) return jsonError("DPI duplicado", 409);
        return jsonError(m, 500);
      }
    }
    if (eliminarDocumento) {
      try {
        const c = await actualizarCliente(id, { ...parsed.data, dpiDocumentoUrl: null });
        if (anterior.dpiDocumentoUrl) await eliminarArchivoDisco(anterior.dpiDocumentoUrl);
        return NextResponse.json(c);
      } catch (e) {
        const m = e instanceof Error ? e.message : "Error";
        if (m.includes("Record to update not found")) return jsonError("No encontrado", 404);
        if (m.includes("Unique")) return jsonError("DPI duplicado", 409);
        return jsonError(m, 500);
      }
    }
    try {
      const c = await actualizarCliente(id, parsed.data);
      return NextResponse.json(c);
    } catch (e) {
      const m = e instanceof Error ? e.message : "Error";
      if (m.includes("Record to update not found")) return jsonError("No encontrado", 404);
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
    return jsonError(parsed.error.issues[0]?.message ?? "Validación", 400);
  }
  try {
    const c = await actualizarCliente(id, parsed.data);
    return NextResponse.json(c);
  } catch (e) {
    const m = e instanceof Error ? e.message : "Error";
    if (m.includes("Record to update not found")) return jsonError("No encontrado", 404);
    if (m.includes("Unique")) return jsonError("DPI duplicado", 409);
    return jsonError(m, 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { session, response } = await getSessionOr401();
  if (response) return response;
  if (!session) return jsonError("No autorizado", 401);
  const id = params.id;
  try {
    await eliminarCliente(id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    const m = e instanceof Error ? e.message : "Error";
    if (m.includes("Record to delete not found") || m.includes("not found")) {
      return jsonError("No encontrado", 404);
    }
    if (m.includes("préstamos")) return jsonError(m, 409);
    return jsonError(m, 500);
  }
}
