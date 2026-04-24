"use client";

import { getSession, signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { styles } from "./login-inline-styles";

const errMsg: Record<string, string> = {
  CredentialsSignin: "Usuario o contraseña incorrectos.",
  Configuration: "Error de configuración (NEXTAUTH_SECRET / NEXTAUTH_URL).",
  AccessDenied: "Acceso denegado.",
  SessionRequired: "Debes iniciar sesión.",
};

function LoginForm() {
  const [err, setErr] = useState<string | null>(null);
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const errFromUrl = p.get("error");
    if (errFromUrl) {
      setErr(errFromUrl);
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    getSession()
      .then((s) => {
        if (cancel) return;
        if (s) {
          window.location.replace("/dashboard");
        }
      })
      .catch(() => {});
    return () => {
      cancel = true;
    };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    const callbackUrl = `${window.location.origin}/dashboard`;
    try {
      const r = await signIn("credentials", {
        redirect: false,
        callbackUrl,
        usuario: usuario.trim(),
        password,
      });
      if (r?.url && !r.error) {
        window.location.href = r.url;
        return;
      }
      setErr(r?.error ?? "CredentialsSignin");
    } catch {
      setErr("No se pudo conectar. Comprueba que el servidor esté en marcha (npm run dev).");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={styles.form} noValidate>
      <div>
        <div style={styles.logo} aria-hidden>
          P
        </div>
        <h1 style={styles.h1}>Sistema de préstamos</h1>
        <p style={styles.sub}>Inicia sesión para continuar</p>
      </div>
      {err && <p style={styles.err} role="alert">{errMsg[err] ?? err}</p>}
      <div style={styles.field}>
        <label style={styles.label} htmlFor="login-usuario">
          Usuario
        </label>
        <input
          id="login-usuario"
          name="usuario"
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          autoComplete="username"
          disabled={submitting}
          style={styles.input}
        />
      </div>
      <div style={styles.field}>
        <label style={styles.label} htmlFor="login-password">
          Contraseña
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={submitting}
          style={styles.input}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        style={{
          ...styles.btn,
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div style={styles.shell}>
      <LoginForm />
    </div>
  );
}
