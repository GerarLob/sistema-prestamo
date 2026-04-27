/**
 * Carga `.env` y ejecuta el CLI de Prisma en Windows (PowerShell/CMD).
 * Uso: node scripts/prisma-win.cjs db push
 */
require("dotenv").config();
const { spawnSync } = require("child_process");

const rest = process.argv.slice(2);
if (rest.length === 0) {
  console.error("Ej: node scripts/prisma-win.cjs migrate deploy");
  process.exit(1);
}
const r = spawnSync("npx", ["prisma", ...rest], { stdio: "inherit", shell: true, env: process.env });
process.exit(r.status === null ? 1 : r.status);
