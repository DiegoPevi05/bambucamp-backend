/*
  Warnings:

  - You are about to drop the column `limitAge` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `qtyPeople` on the `Experience` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "limitAge",
DROP COLUMN "qtyPeople",
ADD COLUMN     "limit_age" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "qtypeople" INTEGER NOT NULL DEFAULT 1;
