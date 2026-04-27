import "dotenv/config";
import { UserRole } from "../lib/enums";
import { prisma } from "../lib/prisma";
import { hash } from "bcryptjs";

/** Admin por defecto: usuario `admin`, contraseña `admin123#` (ADMIN_SEED_USUARIO / ADMIN_SEED_PASSWORD en .env). */
async function main() {
  const pass = process.env.ADMIN_SEED_PASSWORD ?? "admin123#";
  const usuario = (process.env.ADMIN_SEED_USUARIO ?? "admin").trim().toLowerCase();
  const passwordHash = await hash(pass, 10);
  /** Si existe ADMIN_SEED_PASSWORD, el update aplica nuevo hash (p. ej. rotar clave en despliegue). */
  const adminUpdate = (process.env.ADMIN_SEED_PASSWORD ?? "").trim()
    ? { passwordHash, nombre: "Administrador principal", role: UserRole.admin }
    : { nombre: "Administrador principal", role: UserRole.admin };

  await prisma.usuario.upsert({
    where: { usuario },
    create: {
      usuario,
      passwordHash,
      nombre: "Administrador principal",
      role: UserRole.admin,
    },
    update: adminUpdate,
  });

  await prisma.usuario.upsert({
    where: { usuario: "vendedor" },
    create: {
      usuario: "vendedor",
      passwordHash: await hash("user123", 10),
      nombre: "Usuario de ejemplo",
      role: UserRole.usuario,
    },
    update: {},
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
