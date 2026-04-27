import { getSessionOr401, jsonError } from "@/lib/api-helpers";
import { formatearDpi } from "@/lib/formatear-dpi";
import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const { session, response } = await getSessionOr401();
  if (response) return response;
  if (!session) return jsonError("No autorizado", 401);

  const clientes = await prisma.cliente.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { prestamos: true } } },
  });

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const titulo = "Listado de clientes";
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, 14, 14);

  const empresa = process.env.NEXT_PUBLIC_NOMBRE_EMPRESA?.trim();
  if (empresa) {
    doc.text(empresa, pageW - 14, 14, { align: "right" });
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const fecha = new Date().toLocaleString("es-GT", { dateStyle: "medium", timeStyle: "short" });
  doc.text(`Generado: ${fecha}`, 14, 20);

  if (clientes.length === 0) {
    doc.setFontSize(11);
    doc.text("No hay clientes registrados.", 14, 32);
  } else {
    const body = clientes.map((c) => [
      c.nombre,
      formatearDpi(c.dpi),
      c.dpiDocumentoUrl ? "Sí" : "No",
      c.telefono?.trim() || "—",
      c.direccion?.trim() || "—",
      String(c._count.prestamos),
    ]);

    autoTable(doc, {
      startY: 26,
      head: [["Cliente", "DPI", "Expediente DPI", "Teléfono", "Dirección", "Préstamos"]],
      body,
      styles: { fontSize: 8, cellPadding: 1.5, overflow: "linebreak" },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 35 },
        2: { halign: "center", cellWidth: 22 },
        3: { cellWidth: 30 },
        4: { cellWidth: "auto" as const },
        5: { halign: "center", cellWidth: 18 },
      },
      margin: { left: 14, right: 14 },
    });
  }

  const buf = doc.output("arraybuffer");
  const nombreArchivo = `clientes-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nombreArchivo}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
