/*
  Warnings:

  - You are about to drop the column `idexperiences` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `idproducts` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the column `idtents` on the `Promotion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "idexperiences",
DROP COLUMN "idproducts",
DROP COLUMN "idtents";

-- CreateTable
CREATE TABLE "optTentPromotion" (
    "id" SERIAL NOT NULL,
    "idTent" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "promotionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "optTentPromotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optProductPromotion" (
    "id" SERIAL NOT NULL,
    "idProduct" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "promotionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "optProductPromotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optExperiencePromotion" (
    "id" SERIAL NOT NULL,
    "idExperience" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "promotionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "optExperiencePromotion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "optTentPromotion" ADD CONSTRAINT "optTentPromotion_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "optProductPromotion" ADD CONSTRAINT "optProductPromotion_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "optExperiencePromotion" ADD CONSTRAINT "optExperiencePromotion_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
