/*
  Warnings:

  - Made the column `idproducts` on table `Promotion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `idexperiences` on table `Promotion` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Promotion" ALTER COLUMN "idproducts" SET NOT NULL,
ALTER COLUMN "idproducts" SET DEFAULT '[]',
ALTER COLUMN "idexperiences" SET NOT NULL,
ALTER COLUMN "idexperiences" SET DEFAULT '[]';
