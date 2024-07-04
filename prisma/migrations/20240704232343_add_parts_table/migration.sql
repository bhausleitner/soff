-- CreateTable
CREATE TABLE "Part" (
    "id" SERIAL NOT NULL,
    "partNumber" TEXT,
    "partName" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "cadFile" TEXT,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SupplierParts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Part_partName_idx" ON "Part"("partName");

-- CreateIndex
CREATE UNIQUE INDEX "_SupplierParts_AB_unique" ON "_SupplierParts"("A", "B");

-- CreateIndex
CREATE INDEX "_SupplierParts_B_index" ON "_SupplierParts"("B");

-- AddForeignKey
ALTER TABLE "_SupplierParts" ADD CONSTRAINT "_SupplierParts_A_fkey" FOREIGN KEY ("A") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SupplierParts" ADD CONSTRAINT "_SupplierParts_B_fkey" FOREIGN KEY ("B") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
