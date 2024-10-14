-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR');

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'USD';
