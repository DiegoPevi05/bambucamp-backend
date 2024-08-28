-- DropIndex
DROP INDEX "Reserve_external_id_key";

-- AlterTable
ALTER TABLE "Reserve" ALTER COLUMN "external_id" DROP NOT NULL;
