import { PrismaClient, Reserve   } from "@prisma/client";
import { ReserveDto } from "../dto/reserve";

const prisma = new PrismaClient();


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
    data
  });
};

export const updateReserve = async (id:number, data: ReserveDto): Promise<Reserve> => {
  return await prisma.reserve.update({
    where: { id },
    data
  });
};

export const deleteReserve = async (id: number): Promise<Reserve> => {
  return await prisma.reserve.delete({
    where: { id }
  });
};


