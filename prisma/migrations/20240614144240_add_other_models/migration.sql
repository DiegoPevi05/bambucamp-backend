-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PENDING', 'DEBT');

-- CreateTable
CREATE TABLE "Tent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "qtypeople" INTEGER,
    "qtykids" INTEGER,
    "imgroutes" TEXT,
    "price" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "custom_price" TEXT DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "idproduct" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "imgroutes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "custom_price" TEXT DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("idproduct")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "idexperiences" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "subcategory" TEXT NOT NULL,
    "Header" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" TEXT NOT NULL,
    "imgRoute" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "custom_price" TEXT DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("idexperiences")
);

-- CreateTable
CREATE TABLE "ExperienceCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExperienceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "idpromotion" SERIAL NOT NULL,
    "code" TEXT,
    "description" TEXT NOT NULL,
    "imgroute" TEXT,
    "expiredDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "qtypeople" INTEGER,
    "qtyKids" INTEGER,
    "idtents" TEXT,
    "idproducts" TEXT,
    "idexperiences" TEXT,
    "netImport" DOUBLE PRECISION,
    "discount" INTEGER,
    "grossImport" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("idpromotion")
);

-- CreateTable
CREATE TABLE "Reserve" (
    "idsale" SERIAL NOT NULL,
    "qtypeople" INTEGER,
    "qtyKids" INTEGER,
    "userId" INTEGER NOT NULL,
    "amountTotal" DOUBLE PRECISION,
    "dateFrom" DATE NOT NULL,
    "dateTo" DATE NOT NULL,
    "dateSale" DATE NOT NULL,
    "promotionId" INTEGER DEFAULT 0,
    "PayAmountTotal" DOUBLE PRECISION,
    "canceled_reason" TEXT,
    "canceled_status" BOOLEAN NOT NULL DEFAULT false,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "AditionalPeople" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reserve_pkey" PRIMARY KEY ("idsale")
);

-- CreateTable
CREATE TABLE "ReserveTent" (
    "reserveId" INTEGER NOT NULL,
    "tentId" INTEGER NOT NULL,

    CONSTRAINT "ReserveTent_pkey" PRIMARY KEY ("reserveId","tentId")
);

-- CreateTable
CREATE TABLE "ReserveProduct" (
    "reserveId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ReserveProduct_pkey" PRIMARY KEY ("reserveId","productId")
);

-- CreateTable
CREATE TABLE "ReserveExperience" (
    "reserveId" INTEGER NOT NULL,
    "experienceId" INTEGER NOT NULL,

    CONSTRAINT "ReserveExperience_pkey" PRIMARY KEY ("reserveId","experienceId")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExperienceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserve" ADD CONSTRAINT "Reserve_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserve" ADD CONSTRAINT "Reserve_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("idpromotion") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveTent" ADD CONSTRAINT "ReserveTent_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserve"("idsale") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveTent" ADD CONSTRAINT "ReserveTent_tentId_fkey" FOREIGN KEY ("tentId") REFERENCES "Tent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveProduct" ADD CONSTRAINT "ReserveProduct_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserve"("idsale") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveProduct" ADD CONSTRAINT "ReserveProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("idproduct") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveExperience" ADD CONSTRAINT "ReserveExperience_reserveId_fkey" FOREIGN KEY ("reserveId") REFERENCES "Reserve"("idsale") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReserveExperience" ADD CONSTRAINT "ReserveExperience_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("idexperiences") ON DELETE RESTRICT ON UPDATE CASCADE;
