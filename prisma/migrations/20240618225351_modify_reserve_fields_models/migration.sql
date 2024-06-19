/*
  Warnings:

  - You are about to drop the column `payAmountTotal` on the `Reserve` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reserve" DROP COLUMN "payAmountTotal",
ADD COLUMN     "discount" INTEGER,
ADD COLUMN     "grossImport" DOUBLE PRECISION,
ADD COLUMN     "netImport" DOUBLE PRECISION,
ADD COLUMN     "price_is_calculated" BOOLEAN NOT NULL DEFAULT false;
