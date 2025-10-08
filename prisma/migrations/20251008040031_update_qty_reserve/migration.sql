/*
  Warnings:

  - You are about to drop the column `qtykids` on the `ReserveTent` table. All the data in the column will be lost.
  - You are about to drop the column `qtypeople` on the `ReserveTent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReserveTent" DROP COLUMN "qtykids",
DROP COLUMN "qtypeople";
