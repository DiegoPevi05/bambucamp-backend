/*
  Warnings:

  - Made the column `external_id` on table `Reserve` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Reserve" ALTER COLUMN "external_id" SET NOT NULL;
