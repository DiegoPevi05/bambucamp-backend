/*
  Warnings:

  - You are about to drop the column `imgRoute` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `imgroutes` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imgroute` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `imgroutes` on the `Tent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "imgRoute",
ADD COLUMN     "images" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imgroutes",
ADD COLUMN     "images" TEXT;

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "imgroute",
ADD COLUMN     "images" TEXT;

-- AlterTable
ALTER TABLE "Tent" DROP COLUMN "imgroutes",
ADD COLUMN     "images" TEXT;
