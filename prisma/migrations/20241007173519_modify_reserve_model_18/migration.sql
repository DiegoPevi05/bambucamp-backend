-- AlterTable
ALTER TABLE "Reserve" ADD COLUMN     "eta" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "document_id" TEXT NOT NULL DEFAULT 'null',
ADD COLUMN     "document_type" TEXT NOT NULL DEFAULT 'DNI';
