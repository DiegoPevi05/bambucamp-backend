/*
  Warnings:

  - You are about to drop the column `quantity` on the `optTentPromotion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "optTentPromotion" DROP COLUMN "quantity",
ADD COLUMN     "nights" INTEGER NOT NULL DEFAULT 1;
