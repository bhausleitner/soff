/*
  Warnings:

  - You are about to drop the column `response_time` on the `Supplier` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "response_time",
ADD COLUMN     "responseTime" INTEGER DEFAULT 48;
