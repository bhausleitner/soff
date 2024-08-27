-- CreateTable
CREATE TABLE "CcRecipient" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "messageId" INTEGER NOT NULL,

    CONSTRAINT "CcRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CcRecipient_messageId_idx" ON "CcRecipient"("messageId");

-- AddForeignKey
ALTER TABLE "CcRecipient" ADD CONSTRAINT "CcRecipient_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
