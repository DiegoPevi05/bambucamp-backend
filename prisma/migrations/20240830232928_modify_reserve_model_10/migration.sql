-- AlterTable
ALTER TABLE "ReserveExperience" ADD COLUMN     "confirmed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ReserveProduct" ADD COLUMN     "confirmed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ReservePromotion" ADD COLUMN     "confirmed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ReserveTent" ADD COLUMN     "confirmed" BOOLEAN NOT NULL DEFAULT false;
