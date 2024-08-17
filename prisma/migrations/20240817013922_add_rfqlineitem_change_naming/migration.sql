/*
  Warnings:

  - You are about to drop the `RFQLineItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RFQLineItem" DROP CONSTRAINT "RFQLineItem_requestForQuoteId_fkey";

-- DropTable
DROP TABLE "RFQLineItem";

-- CreateTable
CREATE TABLE "RfqLineItem" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER,
    "description" TEXT,
    "fileNames" TEXT[],
    "requestForQuoteId" INTEGER NOT NULL,

    CONSTRAINT "RfqLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RfqLineItem_requestForQuoteId_idx" ON "RfqLineItem"("requestForQuoteId");

-- AddForeignKey
ALTER TABLE "RfqLineItem" ADD CONSTRAINT "RfqLineItem_requestForQuoteId_fkey" FOREIGN KEY ("requestForQuoteId") REFERENCES "RequestForQuote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
