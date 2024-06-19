/*
  Warnings:

  - Made the column `discount` on table `Reserve` required. This step will fail if there are existing NULL values in that column.
  - Made the column `grossImport` on table `Reserve` required. This step will fail if there are existing NULL values in that column.
  - Made the column `netImport` on table `Reserve` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Reserve" ALTER COLUMN "discount" SET NOT NULL,
ALTER COLUMN "discount" SET DEFAULT 0,
ALTER COLUMN "grossImport" SET NOT NULL,
ALTER COLUMN "grossImport" SET DEFAULT 0,
ALTER COLUMN "netImport" SET NOT NULL,
ALTER COLUMN "netImport" SET DEFAULT 0;
