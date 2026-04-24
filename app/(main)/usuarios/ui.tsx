"use client";

import { UserRole } from "@/lib/enums";
import type { UserRole as RolUsuario } from "@/lib/enums";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type U = {
  id: string;
  usuario: string;
  nombre: string;
  role: string;
  createdAt: string;
};

export function UsuariosAdmin({ initial }: { initial: U[] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState(initial);

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [role, setRole] = useState<RolUsuario>(UserRole.usuario);
  const [creating, setCreating] = useState(false);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setCreating(true);
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: nombreUsuario.trim().toLowerCase(),
          password,
          nombre,
          role,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setErr(d.error ?? "Error");
        return;
      }
      setRows((r) => [...r, d].sort((a, b) => a.usuario.localeCompare(b.usuario)));
      setNombreUsuario("");
      setPassword("");
      setNombre("");
      setRole(UserRole.usuario);
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      {err && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {err}
        </p>
      )}

      <section className="surface-liquid p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-slate-900">Nuevo usuario</h2>
        <p className="mt-0.5 text-xs text-slate-600">Nombre de usuario para entrar, contraseña, nombre completo y rol.</p>
        <form onSubmit={crear} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Usuario (inicio de sesión)</label>
            <input
              type="text"
              required
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              className="input-field"
              autoComplete="off"
              minLength={2}
              maxLength={40}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              minLength={6}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Nombre completo</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as RolUsuario)}
              className="input-field"
            >
              <option value={UserRole.usuario}>Usuario</option>
              <option value={UserRole.admin}>Administrador</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? "Creando…" : "Crear usuario"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900">Usuarios registrados</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200/80 bg-white/80">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
              <tr>
                <th className="p-2.5 font-medium">Usuario</th>
                <th className="p-2.5 font-medium">Nombre</th>
                <th className="p-2.5 font-medium">Rol</th>
                <th className="p-2.5 font-medium">Nueva clave</th>
                <th className="p-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <UsuarioFila
                  key={u.id}
                  u={u}
                  esYo={u.id === session?.user?.id}
                  onActualizado={(act) => {
                    setRows((list) => list.map((x) => (x.id === act.id ? act : x)));
                    setErr(null);
                    router.refresh();
                  }}
                  onEliminado={(id) => {
                    setRows((list) => list.filter((x) => x.id !== id));
                    setErr(null);
                    router.refresh();
                  }}
                  onError={setErr}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function UsuarioFila({
  u,
  esYo,
  onActualizado,
  onEliminado,
  onError,
}: {
  u: U;
  esYo: boolean;
  onActualizado: (u: U) => void;
  onEliminado: (id: string) => void;
  onError: (m: string | null) => void;
}) {
  const [nombre, setNombre] = useState(u.nombre);
  const [role, setRole] = useState(u.role);
  const [nuevaClave, setNuevaClave] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNombre(u.nombre);
    setRole(u.role);
  }, [u.id, u.nombre, u.role]);

  async function guardar() {
    onError(null);
    setLoading(true);
    try {
      const body: { nombre: string; role: string; password?: string } = {
        nombre: nombre.trim(),
        role,
      };
      if (nuevaClave.length > 0) {
        if (nuevaClave.length < 6) {
          onError("La contraseña debe tener al menos 6 caracteres");
          return;
        }
        body.password = nuevaClave;
      }
      const res = await fetch(`/api/usuarios/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) {
        onError(d.error ?? "Error");
        return;
      }
      onActualizado(d);
      if (esYo && d.role !== u.role) {
        onError(null);
        alert("Has cambiado tu propio rol. Cierra sesión e inicia sesión de nuevo para que se apliquen los permisos.");
      }
      setNuevaClave("");
    } finally {
      setLoading(false);
    }
  }

  async function eliminar() {
    if (!confirm(`¿Eliminar al usuario «${u.usuario}»?`)) return;
    onError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/usuarios/${u.id}`, { method: "DELETE" });
      if (res.status === 204) {
        onEliminado(u.id);
        return;
      }
      const d = await res.json();
      onError(d.error ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="p-2.5 font-mono text-xs text-slate-700">{u.usuario}</td>
      <td className="p-2.5">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input-field max-w-[200px] py-1.5 text-sm"
        />
      </td>
      <td className="p-2.5">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input-field w-auto min-w-[9rem] py-1.5 text-sm"
        >
          <option value={UserRole.usuario}>Usuario</option>
          <option value={UserRole.admin}>Administrador</option>
        </select>
      </td>
      <td className="p-2.5">
        <input
          type="password"
          value={nuevaClave}
          onChange={(e) => setNuevaClave(e.target.value)}
          placeholder="Opcional"
          className="input-field max-w-[140px] py-1.5 text-sm"
          autoComplete="new-password"
        />
      </td>
      <td className="p-2.5">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={loading}
            onClick={guardar}
            className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            Guardar
          </button>
          {!esYo && (
            <button
              type="button"
              disabled={loading}
              onClick={eliminar}
              className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              Eliminar
            </button>
          )}
        </div>
        {esYo && <p className="mt-1 text-[10px] text-slate-500">Tu usuario (no se puede eliminar)</p>}
      </td>
    </tr>
  );
}
