-- CreateTable
CREATE TABLE "QuoteComparison" (
    "id" SERIAL NOT NULL,
    "quoteIds" INTEGER[],
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteComparison_pkey" PRIMARY KEY ("id")
);
