/*
  Warnings:

  - You are about to drop the column `address` on the `Supplier` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "address",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "erpId" INTEGER,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "street2" TEXT,
ADD COLUMN     "supplierParentId" INTEGER,
ADD COLUMN     "zip" TEXT,
ALTER COLUMN "contactPerson" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_supplierParentId_fkey" FOREIGN KEY ("supplierParentId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
