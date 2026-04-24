import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** Estado del servicio y base de datos (sin datos sensibles). */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const n = await prisma.usuario.count();
    return NextResponse.json({
      ok: true,
      database: "conectada",
      usuarios: n,
    });
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        detalle: m,
      },
      { status: 503 }
    );
  }
}
