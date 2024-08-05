import { PrismaClient, Product   } from "@prisma/client";
import { ProductDto, ProductFilters, PaginatedProducts } from "../dto/product";

const prisma = new PrismaClient();

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllPublicProducts = async (): Promise<Product[]> => {
  return await prisma.product.findMany({
    where: {
      status: 'ACTIVE'
    }
  });
};

export const getAllProducts = async (filters:ProductFilters, pagination:Pagination): Promise<PaginatedProducts> => {
  const { name } = filters;
  const { page, pageSize } = pagination;
  
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const totalCount = await prisma.product.count({
    where: {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
    },
  });

  const products = await prisma.product.findMany({
    where: {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
    },
    skip,
    take
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    products,
    totalPages,
    currentPage: page,
  };
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

export const updateProductImages = async (tentId: number, images: string) => {
  try {
    await prisma.product.update({
      where: { id: tentId },
      data: { images: images }
    });
  } catch (error) {
    console.error('Error updating product images:', error);
    throw new Error('Failed to update product images');
  }
};




