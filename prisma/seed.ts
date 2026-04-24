import { UserRole } from "../lib/enums";
import { prisma } from "../lib/prisma";
import { hash } from "bcryptjs";

/** Antiguas BDs tenían `email`; el esquema actual usa `usuario`. */
async function asegurarColumnaUsuario() {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE Usuario RENAME COLUMN email TO usuario;`
    );
  } catch {
    /* columna ya se llama usuario o no aplica */
  }
}

/** Admin principal por defecto: usuario `admin`, contraseña `admin123#` (configurable por .env). */
async function main() {
  await asegurarColumnaUsuario();
  const pass = process.env.ADMIN_SEED_PASSWORD ?? "admin123#";
  const usuario = (process.env.ADMIN_SEED_USUARIO ?? "admin").trim().toLowerCase();
  const passwordHash = await hash(pass, 10);

  await prisma.usuario.upsert({
    where: { usuario },
    create: {
      usuario,
      passwordHash,
      nombre: "Administrador principal",
      role: UserRole.admin,
    },
    update: {
      passwordHash,
      nombre: "Administrador principal",
      role: UserRole.admin,
    },
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
