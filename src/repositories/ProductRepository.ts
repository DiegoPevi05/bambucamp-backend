import { PrismaClient, Product   } from "@prisma/client";
import { ProductDto, ProductFilters, PaginatedProducts, ProductPublicDto } from "../dto/product";
import {BadRequestError} from "../middleware/errors";

const prisma = new PrismaClient();

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllPublicProducts = async (categories?:string[]): Promise<ProductPublicDto[]> => {
  return await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      ...(categories && { 
        category: {
          name: {
            in: categories, // Filter experiences by the category names array
            mode: 'insensitive', // Optional: make it case-insensitive
          }
        }
      }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      category: true, // Include the category object
    },
  });
};

export const getAllProducts = async (filters:ProductFilters, pagination:Pagination): Promise<PaginatedProducts> => {
  const { name, status } = filters;
  const { page, pageSize } = pagination;
  
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const totalCount = await prisma.product.count({
    where: {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(status && { status: { contains: status, mode: 'insensitive' } }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const products = await prisma.product.findMany({
    where: {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(status && { status: { contains: status, mode: 'insensitive' } }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
    include: {
      category: true, // Include the category object
    },
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

export const updateProductImages = async (productId: number, images: string) => {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { images: images }
    });
  } catch (error) {
    throw new BadRequestError("error.noUpdateImages");
  }
};

export const updateStock = async(productId:number,newStock:number) => {
  return await prisma.product.update({
    where: { id: productId },
    data:{
      stock:newStock,
    }
  });
}




