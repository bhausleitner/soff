-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "requestForQuoteId" INTEGER;

-- CreateTable
CREATE TABLE "RequestForQuote" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "RequestForQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PartToRequestForQuote" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_RequestForQuoteToSupplier" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "RequestForQuote_organizationId_idx" ON "RequestForQuote"("organizationId");

-- CreateIndex
CREATE INDEX "RequestForQuote_createdAt_idx" ON "RequestForQuote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_PartToRequestForQuote_AB_unique" ON "_PartToRequestForQuote"("A", "B");

-- CreateIndex
CREATE INDEX "_PartToRequestForQuote_B_index" ON "_PartToRequestForQuote"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestForQuoteToSupplier_AB_unique" ON "_RequestForQuoteToSupplier"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestForQuoteToSupplier_B_index" ON "_RequestForQuoteToSupplier"("B");

-- CreateIndex
CREATE INDEX "Chat_requestForQuoteId_idx" ON "Chat"("requestForQuoteId");

-- CreateIndex
CREATE INDEX "Chat_createdAt_idx" ON "Chat"("createdAt");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "MsalTokenCache_createdAt_idx" ON "MsalTokenCache"("createdAt");

-- CreateIndex
CREATE INDEX "Order_orderDate_idx" ON "Order"("orderDate");

-- CreateIndex
CREATE INDEX "Order_deliveryDate_idx" ON "Order"("deliveryDate");

-- CreateIndex
CREATE INDEX "Organization_emailProvider_idx" ON "Organization"("emailProvider");

-- CreateIndex
CREATE INDEX "Organization_erp_idx" ON "Organization"("erp");

-- CreateIndex
CREATE INDEX "Part_partNumber_idx" ON "Part"("partNumber");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt");

-- CreateIndex
CREATE INDEX "Quote_isActive_idx" ON "Quote"("isActive");

-- CreateIndex
CREATE INDEX "QuoteComparison_createdAt_idx" ON "QuoteComparison"("createdAt");

-- CreateIndex
CREATE INDEX "Supplier_status_idx" ON "Supplier"("status");

-- CreateIndex
CREATE INDEX "Supplier_createdAt_idx" ON "Supplier"("createdAt");

-- CreateIndex
CREATE INDEX "SupplierPart_supplierId_idx" ON "SupplierPart"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierPart_partId_idx" ON "SupplierPart"("partId");

-- CreateIndex
CREATE INDEX "User_clerkUserId_idx" ON "User"("clerkUserId");

-- AddForeignKey
ALTER TABLE "RequestForQuote" ADD CONSTRAINT "RequestForQuote_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_requestForQuoteId_fkey" FOREIGN KEY ("requestForQuoteId") REFERENCES "RequestForQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PartToRequestForQuote" ADD CONSTRAINT "_PartToRequestForQuote_A_fkey" FOREIGN KEY ("A") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PartToRequestForQuote" ADD CONSTRAINT "_PartToRequestForQuote_B_fkey" FOREIGN KEY ("B") REFERENCES "RequestForQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestForQuoteToSupplier" ADD CONSTRAINT "_RequestForQuoteToSupplier_A_fkey" FOREIGN KEY ("A") REFERENCES "RequestForQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestForQuoteToSupplier" ADD CONSTRAINT "_RequestForQuoteToSupplier_B_fkey" FOREIGN KEY ("B") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
