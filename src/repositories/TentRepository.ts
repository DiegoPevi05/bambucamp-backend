import { PrismaClient, Tent } from "@prisma/client";
import { TentDto, TentFilters, PaginatedTents } from "../dto/tent";
import { BadRequestError } from "../middleware/errors";

const prisma = new PrismaClient();

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllPublicTents = async (): Promise<Tent[]> => {
  return await prisma.tent.findMany({
    where: {
      status: 'ACTIVE'
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getAllTents = async (filters: TentFilters, pagination: Pagination): Promise<PaginatedTents> => {

  const { title, status } = filters;
  const { page, pageSize } = pagination;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const totalCount = await prisma.tent.count({
    where: {
      ...(title && { title: { contains: title, mode: 'insensitive' } }),
      ...(status && { status: { contains: status, mode: 'insensitive' } }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const tents = await prisma.tent.findMany({
    where: {
      ...(title && { title: { contains: title, mode: 'insensitive' } }),
      ...(status && { status: { contains: status, mode: 'insensitive' } }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tents,
    totalPages,
    currentPage: page,
  };
};

export const getTentById = async (id: number): Promise<Tent | null> => {
  return await prisma.tent.findUnique({
    where: { id }
  });
};

export const getTentsByIds = async (ids: number[]): Promise<Tent[]> => {
  return await prisma.tent.findMany({
    where: {
      id: {
        in: ids
      }
    }
  });
};


export const createTent = async (data: TentDto): Promise<Tent> => {
  return await prisma.tent.create({
    data
  });
};

export const updateTent = async (id: number, data: TentDto): Promise<Tent> => {
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

export const updateTentImages = async (tentId: number, images: string) => {
  try {
    await prisma.tent.update({
      where: { id: tentId },
      data: { images: images }
    });
  } catch (error) {
    console.error('Error updating tent images:', error);
    throw new BadRequestError("error.noUpdateImages");
  }
};


