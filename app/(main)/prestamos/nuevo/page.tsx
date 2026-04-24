import { prisma } from "@/lib/prisma";
import { NuevoPrestamoForm } from "./form";

type Props = { searchParams: { clienteId?: string } };

export default async function NuevoPrestamoPage({ searchParams }: Props) {
  const clientes = await prisma.cliente.findMany({ orderBy: { nombre: "asc" } });
  const defaultCliente = searchParams.clienteId ?? (clientes[0]?.id ?? "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Nuevo préstamo</h1>
        <p className="text-sm text-slate-600">Se genera la tabla de amortización y las cuotas automáticamente</p>
      </div>
      {clientes.length === 0 ? (
        <p className="text-slate-600">
          Necesitas al menos un cliente.{" "}
          <a href="/clientes/nuevo" className="text-sky-600">
            Crear cliente
          </a>
        </p>
      ) : (
        <NuevoPrestamoForm clientes={clientes} defaultClienteId={defaultCliente} />
      )}
    </div>
  );
}
