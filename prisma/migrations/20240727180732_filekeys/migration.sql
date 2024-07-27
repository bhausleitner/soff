/*
  Warnings:

  - You are about to drop the column `hasAttachments` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "hasAttachments",
ADD COLUMN     "fileKeys" TEXT[];
