import { PrismaClient, DiscountCode } from "@prisma/client";
import { DiscountCodeDto, DiscountCodeFilters, PaginatedDiscountCodes } from "../dto/discountcode";

const prisma = new PrismaClient();

interface Pagination {
  page: number;
  pageSize: number;
}

export const getDiscountCodeByCode = async (code: string): Promise<DiscountCode | null> => {
  return await prisma.discountCode.findFirst({
    where: { code }
  });
};

export const getAllDiscountCodes = async (filters:DiscountCodeFilters,pagination:Pagination): Promise<PaginatedDiscountCodes> => {
  const { code, status } = filters;
  const { page, pageSize } = pagination;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const totalCount = await prisma.discountCode.count({
    where: {
      ...(code && { code: { contains: code, mode: 'insensitive' } }),
      ...(status && { status: { contains: status, mode: 'insensitive' } }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const discountCodes = await prisma.discountCode.findMany({
    where: {
      ...(code && { code: { contains: code, mode: 'insensitive' } }),
      ...(status && { status: { contains: status, mode: 'insensitive' } }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    discountCodes,
    totalPages,
    currentPage: page,
  };

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

export const updateDiscountCodeStock = async(id:number, newStock:number):Promise<DiscountCode> => {
  return await prisma.discountCode.update({
    where: { id },
    data:{
      stock:newStock
    }
  });
}

export const deleteDiscountCode = async (id: number): Promise<DiscountCode> => {
  return await prisma.discountCode.delete({
    where: { id }
  });
};


