-- AlterTable
ALTER TABLE "Supplier" ALTER COLUMN "response_time" DROP NOT NULL,
ALTER COLUMN "response_time" SET DEFAULT 48;
