import { z } from "zod";

export const clienteCreateSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(200),
  dpi: z.string().min(1, "El DPI es obligatorio").max(30),
  telefono: z
    .string()
    .max(30)
    .optional()
    .transform((s) => s?.trim() || null),
  direccion: z
    .string()
    .max(500)
    .optional()
    .transform((s) => s?.trim() || null),
});

export const clienteIdSchema = z.object({
  id: z.string().min(1),
});
