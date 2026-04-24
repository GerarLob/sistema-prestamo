/** Valores permitidos (Prisma SQLite no usa enums nativos; se guardan como texto). */
export const UserRole = {
  admin: "admin",
  usuario: "usuario",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const TipoInteres = {
  SIMPLE: "SIMPLE",
  COMPUESTO: "COMPUESTO",
} as const;
export type TipoInteres = (typeof TipoInteres)[keyof typeof TipoInteres];
