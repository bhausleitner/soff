/*
  Warnings:

  - You are about to drop the column `price` on the `Part` table. All the data in the column will be lost.
  - You are about to drop the column `partId` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Quote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_partId_fkey";

-- AlterTable
ALTER TABLE "Part" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "Quote" DROP COLUMN "partId",
DROP COLUMN "quantity",
ADD COLUMN     "paymentTerms" TEXT;

-- CreateTable
CREATE TABLE "LineItem" (
    "id" SERIAL NOT NULL,
    "partId" INTEGER NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "leadTime" TEXT,
    "quoteId" INTEGER NOT NULL,

    CONSTRAINT "LineItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
