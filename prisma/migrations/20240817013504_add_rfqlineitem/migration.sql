-- CreateTable
CREATE TABLE "RFQLineItem" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER,
    "description" TEXT,
    "fileNames" TEXT[],
    "requestForQuoteId" INTEGER NOT NULL,

    CONSTRAINT "RFQLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RFQLineItem_requestForQuoteId_idx" ON "RFQLineItem"("requestForQuoteId");

-- AddForeignKey
ALTER TABLE "RFQLineItem" ADD CONSTRAINT "RFQLineItem_requestForQuoteId_fkey" FOREIGN KEY ("requestForQuoteId") REFERENCES "RequestForQuote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
