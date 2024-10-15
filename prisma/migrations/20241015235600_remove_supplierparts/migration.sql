/*
  Warnings:

  - You are about to drop the `SupplierPart` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SupplierPart" DROP CONSTRAINT "SupplierPart_partId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierPart" DROP CONSTRAINT "SupplierPart_supplierId_fkey";

-- DropTable
DROP TABLE "SupplierPart";
