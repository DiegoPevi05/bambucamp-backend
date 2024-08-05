/*
  Warnings:

  - Made the column `custom_price` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "custom_price" SET NOT NULL;
