-- CreateEnum
CREATE TYPE "RfqStatus" AS ENUM ('ACTIVE', 'REVIEW', 'CLOSED', 'AWARDED');

-- AlterTable
ALTER TABLE "RequestForQuote" ADD COLUMN     "status" "RfqStatus" NOT NULL DEFAULT 'ACTIVE';
