/*
  Warnings:

  - You are about to drop the column `partId` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the `Part` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PartToRequestForQuote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LineItem" DROP CONSTRAINT "LineItem_partId_fkey";

-- DropForeignKey
ALTER TABLE "_PartToRequestForQuote" DROP CONSTRAINT "_PartToRequestForQuote_A_fkey";

-- DropForeignKey
ALTER TABLE "_PartToRequestForQuote" DROP CONSTRAINT "_PartToRequestForQuote_B_fkey";

-- DropIndex
DROP INDEX "LineItem_partId_idx";

-- AlterTable
ALTER TABLE "LineItem" DROP COLUMN "partId";

-- DropTable
DROP TABLE "Part";

-- DropTable
DROP TABLE "_PartToRequestForQuote";

-- CreateTable
CREATE TABLE "ErpProduct" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "productCode" TEXT,
    "organizationId" INTEGER,

    CONSTRAINT "ErpProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ErpProduct_productId_idx" ON "ErpProduct"("productId");

-- CreateIndex
CREATE INDEX "ErpProduct_productName_idx" ON "ErpProduct"("productName");

-- CreateIndex
CREATE INDEX "ErpProduct_productCode_idx" ON "ErpProduct"("productCode");

-- CreateIndex
CREATE INDEX "ErpProduct_organizationId_idx" ON "ErpProduct"("organizationId");

-- AddForeignKey
ALTER TABLE "ErpProduct" ADD CONSTRAINT "ErpProduct_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
