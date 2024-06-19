import { PrismaClient, DiscountCode } from "@prisma/client";
import { DiscountCodeDto } from "../dto/discountcode";

const prisma = new PrismaClient();

export const getDiscountCodeByCode = async (code: string): Promise<DiscountCode | null> => {
  return await prisma.discountCode.findFirst({
    where: { code }
  });
};

export const getAllDiscountCodes = async (): Promise<DiscountCode[]> => {
  return await prisma.discountCode.findMany();
};

export const getDiscountCodeById = async (id: number): Promise<DiscountCode | null> => {
  return await prisma.discountCode.findUnique({
    where: { id }
  });
};

export const createDiscountCode = async (data: DiscountCodeDto): Promise<DiscountCode> => {
  return await prisma.discountCode.create({
    data
  });
};

export const updateDiscountCode = async (id:number, data: DiscountCodeDto): Promise<DiscountCode> => {
  return await prisma.discountCode.update({
    where: { id },
    data
  });
};

export const deleteDiscountCode = async (id: number): Promise<DiscountCode> => {
  return await prisma.discountCode.delete({
    where: { id }
  });
};


