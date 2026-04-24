import { UserRole } from "@/lib/enums";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export type UsuarioListado = {
  id: string;
  usuario: string;
  nombre: string;
  role: string;
  createdAt: Date;
};

export async function listarUsuarios(): Promise<UsuarioListado[]> {
  const rows = await prisma.usuario.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, usuario: true, nombre: true, role: true, createdAt: true },
  });
  return rows;
}

export async function contarAdmins(): Promise<number> {
  return prisma.usuario.count({ where: { role: UserRole.admin } });
}

export async function crearUsuario(data: {
  usuario: string;
  password: string;
  nombre: string;
  role: string;
}): Promise<UsuarioListado> {
  const exists = await prisma.usuario.findUnique({ where: { usuario: data.usuario } });
  if (exists) throw new Error("Ya existe un usuario con ese nombre de usuario");

  const passwordHash = await hash(data.password, 10);
  const u = await prisma.usuario.create({
    data: {
      usuario: data.usuario,
      passwordHash,
      nombre: data.nombre.trim(),
      role: data.role,
    },
    select: { id: true, usuario: true, nombre: true, role: true, createdAt: true },
  });
  return u;
}

export async function actualizarUsuario(
  id: string,
  data: { nombre?: string; role?: string; password?: string }
): Promise<UsuarioListado> {
  const u = await prisma.usuario.findUnique({ where: { id } });
  if (!u) throw new Error("Usuario no encontrado");

  if (data.role != null && data.role !== u.role) {
    const admins = await contarAdmins();
    if (u.role === UserRole.admin && data.role === UserRole.usuario && admins <= 1) {
      throw new Error("Debe existir al menos un administrador");
    }
  }

  const update: { nombre?: string; role?: string; passwordHash?: string } = {};
  if (data.nombre != null) update.nombre = data.nombre.trim();
  if (data.role != null) update.role = data.role;
  if (data.password && data.password.length > 0) {
    update.passwordHash = await hash(data.password, 10);
  }

  if (Object.keys(update).length === 0) throw new Error("Sin cambios");

  const out = await prisma.usuario.update({
    where: { id },
    data: update,
    select: { id: true, usuario: true, nombre: true, role: true, createdAt: true },
  });
  return out;
}

export async function eliminarUsuario(id: string, actorId: string): Promise<void> {
  if (id === actorId) throw new Error("No puedes eliminar tu propia cuenta");

  const u = await prisma.usuario.findUnique({ where: { id } });
  if (!u) throw new Error("Usuario no encontrado");

  if (u.role === UserRole.admin) {
    const admins = await contarAdmins();
    if (admins <= 1) throw new Error("No se puede eliminar el único administrador");
  }

  await prisma.usuario.delete({ where: { id } });
}
