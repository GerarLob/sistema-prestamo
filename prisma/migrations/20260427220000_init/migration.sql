-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'usuario',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "dpi" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "dpiDocumentoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestamo" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "tasaAnual" DECIMAL(65,30) NOT NULL,
    "plazoMeses" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "tipoInteres" TEXT NOT NULL,
    "cuotaMensual" DECIMAL(65,30) NOT NULL,
    "totalInteres" DECIMAL(65,30) NOT NULL,
    "totalAPagar" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prestamo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuota" (
    "id" TEXT NOT NULL,
    "prestamoId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "capital" DECIMAL(65,30) NOT NULL,
    "interes" DECIMAL(65,30) NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "pagada" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cuota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "prestamoId" TEXT NOT NULL,
    "cuotaId" TEXT NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_usuario_key" ON "Usuario"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_dpi_key" ON "Cliente"("dpi");

-- CreateIndex
CREATE INDEX "Prestamo_clienteId_idx" ON "Prestamo"("clienteId");

-- CreateIndex
CREATE INDEX "Cuota_prestamoId_idx" ON "Cuota"("prestamoId");

-- CreateIndex
CREATE UNIQUE INDEX "Cuota_prestamoId_numero_key" ON "Cuota"("prestamoId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_cuotaId_key" ON "Pago"("cuotaId");

-- CreateIndex
CREATE INDEX "Pago_prestamoId_idx" ON "Pago"("prestamoId");

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuota" ADD CONSTRAINT "Cuota_prestamoId_fkey" FOREIGN KEY ("prestamoId") REFERENCES "Prestamo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_prestamoId_fkey" FOREIGN KEY ("prestamoId") REFERENCES "Prestamo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_cuotaId_fkey" FOREIGN KEY ("cuotaId") REFERENCES "Cuota"("id") ON DELETE CASCADE ON UPDATE CASCADE;
