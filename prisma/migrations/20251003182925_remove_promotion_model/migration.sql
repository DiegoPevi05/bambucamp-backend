/*
  Warnings:

  - You are about to drop the column `promotionId` on the `ReserveExperience` table. All the data in the column will be lost.
  - You are about to drop the column `promotionId` on the `ReserveProduct` table. All the data in the column will be lost.
  - You are about to drop the column `aditionalPeople` on the `ReserveTent` table. All the data in the column will be lost.
  - You are about to drop the column `aditionalPeoplePrice` on the `ReserveTent` table. All the data in the column will be lost.
  - You are about to drop the column `promotionId` on the `ReserveTent` table. All the data in the column will be lost.
  - You are about to drop the column `aditional_people_price` on the `Tent` table. All the data in the column will be lost.
  - You are about to drop the column `max_aditional_people` on the `Tent` table. All the data in the column will be lost.
  - You are about to drop the `Promotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReservePromotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `optExperiencePromotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `optProductPromotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `optTentPromotion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReservePromotion" DROP CONSTRAINT "ReservePromotion_reserveId_fkey";

-- DropForeignKey
ALTER TABLE "optExperiencePromotion" DROP CONSTRAINT "optExperiencePromotion_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "optProductPromotion" DROP CONSTRAINT "optProductPromotion_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "optTentPromotion" DROP CONSTRAINT "optTentPromotion_promotionId_fkey";

-- AlterTable
ALTER TABLE "ReserveExperience" DROP COLUMN "promotionId";

-- AlterTable
ALTER TABLE "ReserveProduct" DROP COLUMN "promotionId";

-- AlterTable
ALTER TABLE "ReserveTent" DROP COLUMN "aditionalPeople",
DROP COLUMN "aditionalPeoplePrice",
DROP COLUMN "promotionId",
ADD COLUMN     "additional_people" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "additional_people_price" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Tent" DROP COLUMN "aditional_people_price",
DROP COLUMN "max_aditional_people",
ADD COLUMN     "additional_people_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "max_additional_people" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Promotion";

-- DropTable
DROP TABLE "ReservePromotion";

-- DropTable
DROP TABLE "optExperiencePromotion";

-- DropTable
DROP TABLE "optProductPromotion";

-- DropTable
DROP TABLE "optTentPromotion";
