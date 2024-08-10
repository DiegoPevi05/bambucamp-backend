/*
  Warnings:

  - Made the column `promotionId` on table `Reserve` required. This step will fail if there are existing NULL values in that column.
  - Made the column `discountCodeId` on table `Reserve` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Reserve" ALTER COLUMN "promotionId" SET NOT NULL,
ALTER COLUMN "promotionId" SET DEFAULT 0,
ALTER COLUMN "discountCodeId" SET NOT NULL,
ALTER COLUMN "discountCodeId" SET DEFAULT 0;
