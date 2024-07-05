/*
  Warnings:

  - You are about to drop the `_SupplierParts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SupplierParts" DROP CONSTRAINT "_SupplierParts_A_fkey";

-- DropForeignKey
ALTER TABLE "_SupplierParts" DROP CONSTRAINT "_SupplierParts_B_fkey";

-- DropTable
DROP TABLE "_SupplierParts";

-- CreateTable
CREATE TABLE "SupplierPart" (
    "supplierId" INTEGER NOT NULL,
    "partId" INTEGER NOT NULL,

    CONSTRAINT "SupplierPart_pkey" PRIMARY KEY ("supplierId","partId")
);

-- AddForeignKey
ALTER TABLE "SupplierPart" ADD CONSTRAINT "SupplierPart_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierPart" ADD CONSTRAINT "SupplierPart_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
