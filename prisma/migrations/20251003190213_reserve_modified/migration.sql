/*
  Warnings:

  - You are about to drop the column `kidsPrice` on the `ReserveTent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ReserveTent" DROP COLUMN "kidsPrice",
ADD COLUMN     "kids_price" DOUBLE PRECISION NOT NULL DEFAULT 0;
