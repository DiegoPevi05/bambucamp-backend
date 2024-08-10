/*
  Warnings:

  - Made the column `canceled_reason` on table `Reserve` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Reserve" ALTER COLUMN "canceled_reason" SET NOT NULL;
