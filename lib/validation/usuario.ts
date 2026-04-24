import { z } from "zod";
import { UserRole } from "@/lib/enums";

/** Nombre de usuario para iniciar sesión (sin correo). Se guarda en minúsculas. */
const usuarioLogin = z
  .string()
  .min(2, "El nombre de usuario debe tener al menos 2 caracteres")
  .max(40, "Máximo 40 caracteres")
  .transform((s) => s.trim().toLowerCase())
  .refine((s) => s.length >= 2, { message: "Nombre de usuario no válido" });

export const usuarioCreateSchema = z.object({
  usuario: usuarioLogin,
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombre: z.string().min(1, "El nombre es obligatorio").max(200),
  role: z.enum([UserRole.admin, UserRole.usuario] as [string, string]),
});

export const usuarioUpdateSchema = z.object({
  nombre: z.string().min(1).max(200).optional(),
  role: z.enum([UserRole.admin, UserRole.usuario] as [string, string]).optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
});
