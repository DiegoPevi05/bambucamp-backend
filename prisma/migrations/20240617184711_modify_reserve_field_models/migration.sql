/*
  Warnings:

  - You are about to drop the column `AditionalPeople` on the `Reserve` table. All the data in the column will be lost.
  - You are about to drop the column `PayAmountTotal` on the `Reserve` table. All the data in the column will be lost.
  - You are about to drop the column `qtyKids` on the `Reserve` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reserve" DROP COLUMN "AditionalPeople",
DROP COLUMN "PayAmountTotal",
DROP COLUMN "qtyKids",
ADD COLUMN     "aditionalPeople" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "payAmountTotal" DOUBLE PRECISION,
ADD COLUMN     "qtykids" INTEGER;
