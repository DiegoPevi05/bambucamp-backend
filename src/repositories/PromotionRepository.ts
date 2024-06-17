import { PrismaClient, Promotion   } from "@prisma/client";
import { PromotionDto } from "../dto/promotion";

const prisma = new PrismaClient();

export const getAllPublicPromotions = async (): Promise<Promotion[]> => {
  return await prisma.promotion.findMany({
    where: {
      status: 'ACTIVE'
    }
  });
};

export const getAllPromotions = async (): Promise<Promotion[]> => {
  return await prisma.promotion.findMany();
};

export const getPromotionById = async (id: number): Promise<Promotion | null> => {
  return await prisma.promotion.findUnique({
    where: { id }
  });
};

export const getPromotionByCode = async (code: string): Promise<Promotion | null> => {
  return await prisma.promotion.findFirst({
    where: { code }
  });
}

export const createPromotion = async (data: PromotionDto): Promise<Promotion> => {
  return await prisma.promotion.create({
    data
  });
};

export const updatePromotion = async (id:number, data: PromotionDto): Promise<Promotion> => {
  return await prisma.promotion.update({
    where: { id },
    data
  });
};

export const deletePromotion = async (id: number): Promise<Promotion> => {
  return await prisma.promotion.delete({
    where: { id }
  });
};


