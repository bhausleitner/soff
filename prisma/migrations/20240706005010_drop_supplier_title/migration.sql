/*
  Warnings:

  - You are about to drop the column `title` on the `Supplier` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Supplier_title_idx";

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "title",
ALTER COLUMN "name" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Supplier_name_idx" ON "Supplier"("name");
