/*
  Warnings:

  - Made the column `qtypeople` on table `Promotion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `idtents` on table `Promotion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `netImport` on table `Promotion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `discount` on table `Promotion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `grossImport` on table `Promotion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `qtykids` on table `Promotion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `qtypeople` on table `Reserve` required. This step will fail if there are existing NULL values in that column.
  - Made the column `qtykids` on table `Reserve` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Promotion" ALTER COLUMN "qtypeople" SET NOT NULL,
ALTER COLUMN "qtypeople" SET DEFAULT 1,
ALTER COLUMN "idtents" SET NOT NULL,
ALTER COLUMN "netImport" SET NOT NULL,
ALTER COLUMN "discount" SET NOT NULL,
ALTER COLUMN "grossImport" SET NOT NULL,
ALTER COLUMN "qtykids" SET NOT NULL,
ALTER COLUMN "qtykids" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Reserve" ALTER COLUMN "qtypeople" SET NOT NULL,
ALTER COLUMN "qtypeople" SET DEFAULT 1,
ALTER COLUMN "qtykids" SET NOT NULL,
ALTER COLUMN "qtykids" SET DEFAULT 0;
