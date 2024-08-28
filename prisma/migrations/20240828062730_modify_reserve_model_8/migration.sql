/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `Reserve` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `external_id` to the `Reserve` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reserve" ADD COLUMN     "external_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Reserve_external_id_key" ON "Reserve"("external_id");
