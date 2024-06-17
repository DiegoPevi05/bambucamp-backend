/*
  Warnings:

  - You are about to drop the column `qtyKids` on the `Promotion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "qtyKids",
ADD COLUMN     "qtykids" INTEGER;
