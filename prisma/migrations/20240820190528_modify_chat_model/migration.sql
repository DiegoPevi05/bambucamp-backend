/*
  Warnings:

  - Added the required column `type` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_type` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "user_type" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;
