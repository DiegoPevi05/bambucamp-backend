-- AlterTable
ALTER TABLE "Reserve" ALTER COLUMN "dateFrom" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "dateTo" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "dateSale" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "dateSale" SET DATA TYPE TIMESTAMP(3);
