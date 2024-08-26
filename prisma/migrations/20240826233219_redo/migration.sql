/*
  Warnings:

  - Made the column `supplierId` on table `Quote` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_supplierId_fkey";

-- AlterTable
ALTER TABLE "Quote" ALTER COLUMN "supplierId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
