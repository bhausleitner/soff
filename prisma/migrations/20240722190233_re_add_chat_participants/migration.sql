/*
  Warnings:

  - Added the required column `chatParticipantid` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "chatParticipantid" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "id" SERIAL NOT NULL,
    "chatId" INTEGER NOT NULL,
    "supplierId" INTEGER,
    "userId" INTEGER,

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatParticipantid_fkey" FOREIGN KEY ("chatParticipantid") REFERENCES "ChatParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
