/*
  Warnings:

  - The primary key for the `Experience` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Header` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `Title` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `idexperiences` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `subcategory` on the `Experience` table. All the data in the column will be lost.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idproduct` on the `Product` table. All the data in the column will be lost.
  - The primary key for the `Promotion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idpromotion` on the `Promotion` table. All the data in the column will be lost.
  - The primary key for the `Reserve` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idsale` on the `Reserve` table. All the data in the column will be lost.
  - Added the required column `header` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Experience` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reserve" DROP CONSTRAINT "Reserve_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "ReserveExperience" DROP CONSTRAINT "ReserveExperience_experienceId_fkey";

-- DropForeignKey
ALTER TABLE "ReserveExperience" DROP CONSTRAINT "ReserveExperience_reserveId_fkey";

-- DropForeignKey
ALTER TABLE "ReserveProduct" DROP CONSTRAINT "ReserveProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "ReserveProduct" DROP CONSTRAINT "ReserveProduct_reserveId_fkey";

-- DropForeignKey
ALTER TABLE "ReserveTent" DROP CONSTRAINT "ReserveTent_reserveId_fkey";

-- AlterTable
ALTER TABLE "Experience" DROP CONSTRAINT "Experience_pkey",
DROP COLUMN "Header",
DROP COLUMN "Title",
DROP COLUMN "idexperiences",
DROP COLUMN "subcategory",
ADD COLUMN     "header" TEXT NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD CONSTRAINT "Experience_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "idproduct",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_pkey",
DROP COLUMN "idpromotion",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Reserve" DROP CONSTRAINT "Reserve_pkey",
DROP COLUMN "idsale",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Reserve_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Reserve" ADD CONSTRAINT "Reserve_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveTent" ADD CONSTRAINT "ReserveTent_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserve"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveProduct" ADD CONSTRAINT "ReserveProduct_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserve"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveProduct" ADD CONSTRAINT "ReserveProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveExperience" ADD CONSTRAINT "ReserveExperience_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserve"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveExperience" ADD CONSTRAINT "ReserveExperience_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
