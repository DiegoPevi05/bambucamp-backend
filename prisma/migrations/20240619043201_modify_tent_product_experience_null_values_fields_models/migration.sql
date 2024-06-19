/*
  Warnings:

  - Made the column `qtypeople` on table `Tent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `qtykids` on table `Tent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `Tent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Experience" ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Tent" ALTER COLUMN "qtypeople" SET NOT NULL,
ALTER COLUMN "qtypeople" SET DEFAULT 1,
ALTER COLUMN "qtykids" SET NOT NULL,
ALTER COLUMN "qtykids" SET DEFAULT 0,
ALTER COLUMN "price" SET NOT NULL,
ALTER COLUMN "price" SET DEFAULT 0;
