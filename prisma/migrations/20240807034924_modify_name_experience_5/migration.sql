/*
  Warnings:

  - The `duration` column on the `Experience` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `custom_price` on table `Experience` required. This step will fail if there are existing NULL values in that column.
  - Made the column `images` on table `Experience` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "duration",
ADD COLUMN     "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "custom_price" SET NOT NULL,
ALTER COLUMN "images" SET NOT NULL;
