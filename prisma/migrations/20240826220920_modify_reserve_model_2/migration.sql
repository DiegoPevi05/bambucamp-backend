/*
  Warnings:

  - You are about to drop the column `additionalPeople` on the `Reserve` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reserve" DROP COLUMN "additionalPeople",
ADD COLUMN     "aditionalPeople" INTEGER NOT NULL DEFAULT 0;
