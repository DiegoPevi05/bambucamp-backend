/*
  Warnings:

  - You are about to drop the column `amountTotal` on the `Reserve` table. All the data in the column will be lost.
  - Made the column `code` on table `DiscountCode` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DiscountCode" ALTER COLUMN "code" SET NOT NULL;

-- AlterTable
ALTER TABLE "Reserve" DROP COLUMN "amountTotal",
ADD COLUMN     "discountCodeId" INTEGER;

-- AddForeignKey
ALTER TABLE "Reserve" ADD CONSTRAINT "Reserve_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
