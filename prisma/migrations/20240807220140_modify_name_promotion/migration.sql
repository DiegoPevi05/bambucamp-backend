/*
  Warnings:

  - Made the column `expiredDate` on table `Promotion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `images` on table `Promotion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stock` on table `Promotion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `Promotion` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Promotion" ALTER COLUMN "expiredDate" SET NOT NULL,
ALTER COLUMN "expiredDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "images" SET NOT NULL,
ALTER COLUMN "stock" SET NOT NULL,
ALTER COLUMN "stock" SET DEFAULT 1,
ALTER COLUMN "title" SET NOT NULL;
