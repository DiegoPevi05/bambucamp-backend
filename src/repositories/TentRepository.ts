import { PrismaClient, Tent   } from "@prisma/client";
import { TentDto } from "../dto/tent";

const prisma = new PrismaClient();

export const getAllPublicTents = async (): Promise<Tent[]> => {
  return await prisma.tent.findMany({
    where: {
      status: 'ACTIVE'
    }
  });
};

export const getAllTents = async (): Promise<Tent[]> => {
  return await prisma.tent.findMany();
};

export const getTentById = async (id: number): Promise<Tent | null> => {
  return await prisma.tent.findUnique({
    where: { id }
  });
};


export const createTent = async (data: TentDto): Promise<Tent> => {
  return await prisma.tent.create({
    data
  });
};

export const updateTent = async (id:number, data: TentDto): Promise<Tent> => {
  return await prisma.tent.update({
    where: { id },
    data
  });
};

export const deleteTent = async (id: number): Promise<Tent> => {
  return await prisma.tent.delete({
    where: { id }
  });
};


