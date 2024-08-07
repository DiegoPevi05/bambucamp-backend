/*
  Warnings:

  - Made the column `expiredDate` on table `DiscountCode` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stock` on table `DiscountCode` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DiscountCode" ALTER COLUMN "expiredDate" SET NOT NULL,
ALTER COLUMN "expiredDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "stock" SET NOT NULL,
ALTER COLUMN "stock" SET DEFAULT 1;
