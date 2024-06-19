import { PrismaClient, Product   } from "@prisma/client";
import { ProductDto } from "../dto/product";

const prisma = new PrismaClient();

export const getAllPublicProducts = async (): Promise<Product[]> => {
  return await prisma.product.findMany({
    where: {
      status: 'ACTIVE'
    }
  });
};

export const getAllProducts = async (): Promise<Product[]> => {
  return await prisma.product.findMany();
};

export const getProductById = async (id: number): Promise<Product | null> => {
  return await prisma.product.findUnique({
    where: { id }
  });
};

export const getProductsByIds = async (ids: number[]): Promise<Product[]> => {
  return await prisma.product.findMany({
    where: {
      id: {
        in: ids
      }
    }
  });
};

export const createProduct = async (data: ProductDto): Promise<Product> => {
  return await prisma.product.create({
    data
  });
};

export const updateProduct = async (id:number, data: ProductDto): Promise<Product> => {
  return await prisma.product.update({
    where: { id },
    data
  });
};

export const deleteProduct = async (id: number): Promise<Product> => {
  return await prisma.product.delete({
    where: { id }
  });
};


