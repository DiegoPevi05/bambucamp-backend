/*
  Warnings:

  - You are about to drop the column `aditionalPeople` on the `Reserve` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reserve" DROP COLUMN "aditionalPeople",
ADD COLUMN     "additionalPeople" INTEGER NOT NULL DEFAULT 0;
