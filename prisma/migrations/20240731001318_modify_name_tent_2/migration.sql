/*
  Warnings:

  - Made the column `custom_price` on table `Tent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `images` on table `Tent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Tent" ALTER COLUMN "custom_price" SET NOT NULL,
ALTER COLUMN "images" SET NOT NULL;
