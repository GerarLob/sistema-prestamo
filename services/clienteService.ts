import { eliminarArchivoDisco } from "@/lib/dpi-upload";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type ClienteInput = {
  nombre: string;
  dpi: string;
  telefono?: string | null;
  direccion?: string | null;
  /** undefined: no tocar; null: limpiar; string: fijar URL pública del archivo */
  dpiDocumentoUrl?: string | null;
};

export function listarClientes() {
  return prisma.cliente.findMany({ orderBy: { nombre: "asc" } });
}

export function obtenerCliente(id: string) {
  return prisma.cliente.findUnique({ where: { id } });
}

export function crearCliente(data: ClienteInput) {
  return prisma.cliente.create({
    data: {
      nombre: data.nombre.trim(),
      dpi: data.dpi.trim(),
      telefono: data.telefono?.trim() || null,
      direccion: data.direccion?.trim() || null,
      dpiDocumentoUrl: data.dpiDocumentoUrl?.trim() || null,
    },
  });
}

export function actualizarCliente(id: string, data: ClienteInput) {
  const { dpiDocumentoUrl, ...rest } = data;
  const dataUpdate: Prisma.ClienteUpdateInput = {
    nombre: rest.nombre.trim(),
    dpi: rest.dpi.trim(),
    telefono: rest.telefono?.trim() || null,
    direccion: rest.direccion?.trim() || null,
  };
  if (dpiDocumentoUrl !== undefined) {
    dataUpdate.dpiDocumentoUrl = dpiDocumentoUrl;
  }
  return prisma.cliente.update({
    where: { id },
    data: dataUpdate,
  });
}

export async function eliminarCliente(id: string) {
  const c = await prisma.cliente.findUnique({ where: { id } });
  if (!c) {
    throw new Error("Record to delete not found");
  }
  try {
    const deleted = await prisma.cliente.delete({ where: { id } });
    await eliminarArchivoDisco(c.dpiDocumentoUrl);
    return deleted;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      throw new Error("No se puede eliminar: el cliente tiene préstamos asociados");
    }
    throw e;
  }
}
