/**
 * Asegura DATABASE_URL absoluta a prisma/dev.db antes de ejecutar el CLI
 * (misma lógica que lib/prisma.ts). Uso: node scripts/prisma-win.cjs db push
 */
require("dotenv").config();
const { spawnSync } = require("child_process");
const path = require("path");

const u = (process.env.DATABASE_URL || "").trim();
if (!u.startsWith("postgresql:") && !u.startsWith("postgres:")) {
  const abs = path.join(process.cwd(), "prisma", "dev.db");
  process.env.DATABASE_URL = "file:" + abs.split(path.sep).join("/");
}

const rest = process.argv.slice(2);
if (rest.length === 0) {
  console.error("Ej: node scripts/prisma-win.cjs db push");
  process.exit(1);
}
const r = spawnSync("npx", ["prisma", ...rest], { stdio: "inherit", shell: true, env: process.env });
process.exit(r.status === null ? 1 : r.status);
