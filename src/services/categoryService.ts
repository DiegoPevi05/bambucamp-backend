import * as CategoriesRepository from '../repositories/CategoriesRepository';
import { ProductCategoryDto, ExperienceCategoryDto } from '../dto/categories';

/********************EXPERIENCE CATEGORY SERVICES ***************************/
export const getAllExperiencesCategories = async () => {
  return await CategoriesRepository.getAllExperiencesCategories();
};

export const getExperienceCategoryById = async (id: number) => {
  return await CategoriesRepository.getExperienceCategoryById(id);
};

export const createExperienceCategory = async (data: ExperienceCategoryDto) => {
  return await CategoriesRepository.createExperienceCategory(data);
};

export const updateExperienceCategory = async (id:number, data: ExperienceCategoryDto) => {
  return await CategoriesRepository.updateExperienceCategory(id,data);
};

export const deleteExperienceCategory = async (id: number) => {
  return await CategoriesRepository.deleteExperienceCategory(id);
};

/********************PRODUCT CATEGORY SERVICES ***************************/
export const getAllProductCategories = async () => {
  return await CategoriesRepository.getAllProductCategories();
};

export const getProductCategoryById = async (id: number) => {
  return await CategoriesRepository.getProductCategoryById(id);
};

export const createProductCategory = async (data: ProductCategoryDto) => {
  return await CategoriesRepository.createProductCategory(data);
};

export const updateProductCategory = async (id:number,data: ProductCategoryDto) => {
  return await CategoriesRepository.updateProductCategory(id,data);
};

export const deleteProductCategory = async (id: number) => {
  return await CategoriesRepository.deleteProductCategory(id);
};


