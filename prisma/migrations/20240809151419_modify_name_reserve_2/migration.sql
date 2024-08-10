/*
  Warnings:

  - The primary key for the `ReserveExperience` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `experienceId` on the `ReserveExperience` table. All the data in the column will be lost.
  - The primary key for the `ReserveProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `productId` on the `ReserveProduct` table. All the data in the column will be lost.
  - The primary key for the `ReserveTent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tentId` on the `ReserveTent` table. All the data in the column will be lost.
  - Added the required column `idExperience` to the `ReserveExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ReserveExperience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idProduct` to the `ReserveProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ReserveProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idTent` to the `ReserveTent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ReserveTent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reserve" DROP CONSTRAINT "Reserve_discountCodeId_fkey";

-- DropForeignKey
ALTER TABLE "Reserve" DROP CONSTRAINT "Reserve_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "ReserveExperience" DROP CONSTRAINT "ReserveExperience_experienceId_fkey";

-- DropForeignKey
ALTER TABLE "ReserveProduct" DROP CONSTRAINT "ReserveProduct_productId_fkey";

-- DropForeignKey
ALTER TABLE "ReserveTent" DROP CONSTRAINT "ReserveTent_tentId_fkey";

-- AlterTable
ALTER TABLE "ReserveExperience" DROP CONSTRAINT "ReserveExperience_pkey",
DROP COLUMN "experienceId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "idExperience" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD CONSTRAINT "ReserveExperience_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ReserveProduct" DROP CONSTRAINT "ReserveProduct_pkey",
DROP COLUMN "productId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "idProduct" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD CONSTRAINT "ReserveProduct_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ReserveTent" DROP CONSTRAINT "ReserveTent_pkey",
DROP COLUMN "tentId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "idTent" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD CONSTRAINT "ReserveTent_pkey" PRIMARY KEY ("id");
