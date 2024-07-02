/*
  Warnings:

  - Added the required column `response_time` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "response_time" INTEGER NOT NULL;
