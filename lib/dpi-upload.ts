import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "dpi");

export function esMimeDpiPermitido(mime: string): boolean {
  return ALLOWED.has(mime);
}

/**
 * Guarda el archivo y devuelve la ruta pública (ej. /uploads/dpi/uuid.pdf).
 */
export async function guardarArchivoDpi(file: File): Promise<string> {
  if (file.size === 0) {
    throw new Error("El archivo está vacío");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("El archivo supera 8 MB");
  }
  const type = file.type;
  if (!esMimeDpiPermitido(type)) {
    throw new Error("Solo se permiten PDF o imágenes (JPG, PNG, WebP, etc.)");
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || (type === "application/pdf" ? ".pdf" : ".jpg");
  const safeExt = ext.length <= 8 ? ext : ".bin";
  const name = `${randomUUID()}${safeExt}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const full = path.join(UPLOAD_DIR, name);
  await writeFile(full, buffer);
  return `/uploads/dpi/${name}`;
}

/**
 * Ruta en disco a partir de URL pública guardada en BD.
 */
export function rutaPublicaAfs(publicUrl: string | null | undefined): string | null {
  if (!publicUrl || !publicUrl.startsWith("/uploads/")) return null;
  return path.join(process.cwd(), "public", publicUrl.replace(/^\//, ""));
}

export async function eliminarArchivoDisco(publicUrl: string | null | undefined): Promise<void> {
  const fsPath = rutaPublicaAfs(publicUrl);
  if (!fsPath) return;
  try {
    await unlink(fsPath);
  } catch {
    /* no existe o ya se borró */
  }
}
