/*
  Warnings:

  - You are about to drop the column `fileKeys` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "fileKeys",
ADD COLUMN     "fileNames" TEXT[];
