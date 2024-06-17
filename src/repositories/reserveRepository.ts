import { PrismaClient, Reserve, ReserveTent, ReserveProduct, ReserveExperience   } from "@prisma/client";
import { ReserveDto } from "../dto/reserve";


export interface ExtendedReserve extends Reserve {
  tents: ReserveTent[];
  products: ReserveProduct[];
  experiences: ReserveExperience[];
}

const prisma = new PrismaClient();

export const getMyReserves = async (userId:number): Promise<ExtendedReserve[]> => {
  return await prisma.reserve.findMany({
    where: { userId },
    include: {
      tents: true,
      products: true,
      experiences: true,
    },
  });
};

export const getAllReserves = async (): Promise<Reserve[]> => {
  return await prisma.reserve.findMany();
};

export const getReserveById = async (id: number): Promise<Reserve | null> => {
  return await prisma.reserve.findUnique({
    where: { id }
  });
};


export const createReserve = async (data: ReserveDto): Promise<Reserve> => {
  return await prisma.reserve.create({
    data: {
      ...data,
      tents: {
        create: data.tents.map(tent => ({
          tentId: tent.tentId
        }))
      },
      products: {
        create: data.products.map(product => ({
          productId: product.productId
        }))
      },
      experiences: {
        create: data.experiences.map(experience => ({
          experienceId: experience.experienceId
        }))
      }
    }
  });
};

export const updateReserve = async (id:number, data: ReserveDto): Promise<Reserve> => {
  return await prisma.reserve.update({
    where: { id },
    data: {
      ...data,
      tents: {
        create: data.tents.map(tent => ({
          tentId: tent.tentId
        }))
      },
      products: {
        create: data.products.map(product => ({
          productId: product.productId
        }))
      },
      experiences: {
        create: data.experiences.map(experience => ({
          experienceId: experience.experienceId
        }))
      }
    }
  });
};

export const deleteReserve = async (id: number): Promise<Reserve> => {
  return await prisma.reserve.delete({
    where: { id }
  });
};


