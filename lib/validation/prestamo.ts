import { z } from "zod";

const tipo = z.enum(["SIMPLE", "COMPUESTO"]);

export const prestamoCreateSchema = z.object({
  clienteId: z.string().min(1),
  monto: z.coerce.number().positive("El monto debe ser positivo"),
  tasaAnual: z.coerce.number().min(0, "La tasa no puede ser negativa").max(100, "Máx. 100% anual razonable"),
  plazoMeses: z.coerce.number().int("Plazo en meses entero").min(1).max(600),
  fechaInicio: z.coerce.date(),
  tipoInteres: tipo,
});
