"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

const baseLinks = [
  { href: "/dashboard", label: "Panel" },
  { href: "/clientes", label: "Clientes" },
  { href: "/prestamos", label: "Préstamos" },
  { href: "/prestamos/nuevo", label: "Nuevo préstamo" },
];

export function AppNav() {
  const path = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const links =
    session?.user?.role === "admin"
      ? [...baseLinks, { href: "/usuarios", label: "Usuarios" }]
      : baseLinks;

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [path, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-sky-200/40 glass shadow-sm shadow-slate-900/5 print:hidden">
      <div className="mx-auto flex h-14 min-h-14 max-w-5xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4 md:h-16 md:max-w-6xl md:gap-4 lg:max-w-7xl lg:px-6">
        <Link
          href="/dashboard"
          onClick={closeMenu}
          className="group flex min-w-0 shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-slate-900"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white shadow-md shadow-blue-500/30 sm:h-10 sm:w-10"
            aria-hidden
          >
            P
          </span>
          <span className="hidden truncate sm:inline">Préstamos</span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex md:text-sm lg:gap-1.5"
          aria-label="Principal"
        >
          {links.map((l) => {
            const active = path === l.href || path?.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={
                  "whitespace-nowrap rounded-xl px-2.5 py-2 transition lg:px-3.5 " +
                  (active
                    ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-md shadow-blue-600/25"
                    : "text-slate-600 hover:bg-sky-100/60 hover:text-slate-900")
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 text-xs text-slate-600 md:flex md:gap-3">
          <span className="max-w-[100px] truncate lg:max-w-[160px]" title={session?.user?.usuario ?? ""}>
            {session?.user?.name}
          </span>
          <span className="hidden rounded-lg bg-sky-100/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600 lg:inline">
            {session?.user?.role}
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-slate-800 shadow-sm backdrop-blur-sm transition hover:border-sky-200 hover:bg-sky-50/80"
          >
            Salir
          </button>
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="touch-manipulation rounded-xl border border-slate-200/80 bg-white/50 px-2.5 py-2 text-xs font-medium text-slate-800 backdrop-blur-sm"
          >
            Salir
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="touch-manipulation rounded-xl border border-slate-200/80 bg-white/50 p-2.5 text-slate-800 backdrop-blur-sm"
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-menu"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-stretch p-3 pt-16 sm:p-4 md:hidden"
          onClick={closeMenu}
        >
          <div
            className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm"
            aria-hidden
          />
          <div
            id="nav-mobile-menu"
            className="relative z-10 mx-auto w-full max-w-md max-h-[min(85dvh,560px)] overflow-y-auto overscroll-contain rounded-2xl border border-white/60 liquid p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navegación"
          >
            <div className="border-b border-sky-200/50 px-1 pb-3 text-xs text-slate-600">
              <p className="font-medium text-slate-900">{session?.user?.name}</p>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{session?.user?.role}</p>
            </div>
            <ul className="mt-2 flex flex-col gap-1" role="list">
              {links.map((l) => {
                const active = path === l.href || path?.startsWith(l.href + "/");
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={closeMenu}
                      className={
                        "block touch-manipulation rounded-xl px-3 py-3.5 text-base font-medium " +
                        (active
                          ? "bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-md"
                          : "text-slate-800 hover:bg-sky-100/50")
                      }
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
