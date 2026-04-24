import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const s = await getServerSession(authOptions);
  return NextResponse.json({
    tieneSesion: !!s,
    usuario: s?.user?.usuario ?? null,
  });
}
