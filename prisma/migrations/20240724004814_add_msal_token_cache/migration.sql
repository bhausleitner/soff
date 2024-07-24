-- CreateTable
CREATE TABLE "MsalTokenCache" (
    "id" SERIAL NOT NULL,
    "clientId" TEXT NOT NULL,
    "cache" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MsalTokenCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MsalTokenCache_clientId_key" ON "MsalTokenCache"("clientId");
