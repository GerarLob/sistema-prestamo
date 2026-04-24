import { z } from "zod";

export const pagoCreateSchema = z.object({
  cuotaId: z.string().min(1),
  fechaPago: z.coerce.date().optional(),
  observacion: z
    .string()
    .max(500)
    .optional()
    .transform((s) => s?.trim() || undefined),
});

export const pagoIdSchema = z.object({ id: z.string().min(1) });
export const pagoListQuery = z.object({ prestamoId: z.string().min(1) });
