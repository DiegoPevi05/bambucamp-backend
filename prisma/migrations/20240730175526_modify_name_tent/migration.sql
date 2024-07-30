/*
  Warnings:

  - You are about to drop the column `name` on the `Tent` table. All the data in the column will be lost.
  - Added the required column `header` to the `Tent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Tent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tent" DROP COLUMN "name",
ADD COLUMN     "header" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
