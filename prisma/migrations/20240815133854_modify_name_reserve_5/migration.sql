-- DropForeignKey
ALTER TABLE "ReserveExperience" DROP CONSTRAINT "ReserveExperience_reserveId_fkey";

-- DropForeignKey
ALTER TABLE "ReserveProduct" DROP CONSTRAINT "ReserveProduct_reserveId_fkey";

-- DropForeignKey
ALTER TABLE "ReserveTent" DROP CONSTRAINT "ReserveTent_reserveId_fkey";

-- AddForeignKey
ALTER TABLE "ReserveTent" ADD CONSTRAINT "ReserveTent_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserve"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveProduct" ADD CONSTRAINT "ReserveProduct_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserve"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveExperience" ADD CONSTRAINT "ReserveExperience_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserve"("id") ON DELETE CASCADE ON UPDATE CASCADE;
