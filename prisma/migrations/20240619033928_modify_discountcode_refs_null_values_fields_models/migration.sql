/*
  Warnings:

  - Made the column `discount` on table `DiscountCode` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DiscountCode" ALTER COLUMN "discount" SET NOT NULL,
ALTER COLUMN "discount" SET DEFAULT 0;
