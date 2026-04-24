import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditarClienteForm } from "./ui";

type Props = { params: { id: string } };

export default async function EditarClientePage({ params }: Props) {
  const c = await prisma.cliente.findUnique({ where: { id: params.id } });
  if (!c) notFound();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Editar cliente</h1>
          <p className="text-sm text-slate-600">Actualiza los datos o el documento de identidad.</p>
        </div>
        <Link href="/clientes" className="text-sm link-muted w-fit">
          ← Volver a clientes
        </Link>
      </div>
      <EditarClienteForm cliente={c} />
    </div>
  );
}
