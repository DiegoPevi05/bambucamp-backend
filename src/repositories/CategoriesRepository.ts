import { PrismaClient, ExperienceCategory } from "@prisma/client";
import { ExperienceCategoryDto, ProductCategoryDto } from "../dto/categories";

const prisma = new PrismaClient();

/*****************************************EXPERIENCE CATEGORY*************************************/
export const getAllExperiencesCategories = async (): Promise<ExperienceCategory[]> => {
  return await prisma.experienceCategory.findMany();
};

export const getExperienceCategoryById = async (id: number): Promise<ExperienceCategory | null> => {
  return await prisma.experienceCategory.findUnique({
    where: { id }
  });
};

export const createExperienceCategory = async (data: ExperienceCategoryDto): Promise<ExperienceCategory> => {
  return await prisma.experienceCategory.create({
    data
  });
};

export const updateExperienceCategory = async (id:number, data: ExperienceCategoryDto): Promise<ExperienceCategory> => {
  return await prisma.experienceCategory.update({
    where: { id },
    data
  });
};

export const deleteExperienceCategory = async (id: number):Promise<ExperienceCategory> => {
  return await prisma.experienceCategory.delete({
    where: { id }
  });
};

/*****************************************PRODUCT CATEGORY*************************************/

export const getAllProductCategories = async (): Promise<ProductCategoryDto[]> => {
  return await prisma.productCategory.findMany();
}

export const getProductCategoryById = async (id: number): Promise<ProductCategoryDto | null> => {
  return await prisma.productCategory.findUnique({
    where: { id }
  });
};

export const createProductCategory = async (data: ProductCategoryDto): Promise<ProductCategoryDto> => {
  return await prisma.productCategory.create({
    data
  });
};

export const updateProductCategory = async (id:number,data: ProductCategoryDto): Promise<ProductCategoryDto> => {
  return await prisma.productCategory.update({
    where: { id },
    data
  });
};
export const deleteProductCategory = async (id: number): Promise<ProductCategoryDto> => {
  return await prisma.productCategory.delete({
    where: { id  }
  });
};


