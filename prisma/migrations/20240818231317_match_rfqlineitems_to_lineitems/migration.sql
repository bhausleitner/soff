-- AlterTable
ALTER TABLE "LineItem" ADD COLUMN     "rfqLineItemId" INTEGER;

-- CreateIndex
CREATE INDEX "LineItem_rfqLineItemId_idx" ON "LineItem"("rfqLineItemId");

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_rfqLineItemId_fkey" FOREIGN KEY ("rfqLineItemId") REFERENCES "RfqLineItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
