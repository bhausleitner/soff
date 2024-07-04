-- CreateTable
CREATE TABLE "Part" (
    "id" SERIAL NOT NULL,
    "Part Number" TEXT NOT NULL,
    "Part Name" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "CAD file" TEXT NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Part_supplier_idx" ON "Part"("supplier");
