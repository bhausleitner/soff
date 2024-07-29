-- DropForeignKey
ALTER TABLE "LineItem" DROP CONSTRAINT "LineItem_partId_fkey";

-- AlterTable
ALTER TABLE "LineItem" ALTER COLUMN "partId" DROP NOT NULL,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE SET NULL ON UPDATE CASCADE;
