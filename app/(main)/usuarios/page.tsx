import { authOptions } from "@/lib/auth";
import { UserRole } from "@/lib/enums";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { listarUsuarios } from "@/services/usuarioService";
import { UsuariosAdmin } from "./ui";

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== UserRole.admin) redirect("/dashboard");

  const initial = await listarUsuarios();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Usuarios</h1>
        <p className="mt-0.5 text-sm text-slate-600">Crea cuentas y asigna el rol (usuario o administrador).</p>
      </div>
      <UsuariosAdmin
        initial={initial.map((u) => ({
          id: u.id,
          usuario: u.usuario,
          nombre: u.nombre,
          role: u.role,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
