import * as productRepository from '../repositories/ProductRepository';
import { ProductDto } from "../dto/product";

export const getAllPublicProducts = async () => {
  const products = await productRepository.getAllPublicProducts();

  return products.map((product) => ({
    categoryId: product.categoryId,
    name: product.name,
    description: product.description,
    price: product.price,
    images : JSON.parse(product.images ? product.images : '[]')
  }));

};

export const getAllProducts = async () => {
  const products = await productRepository.getAllProducts();
  products.forEach((product) => {
    product.images = JSON.parse(product.images ? product.images : '[]');
  });
  return products;
};

export const getProductById = async (id: number) => {
  return await productRepository.getProductById(id);
};

export const createProduct = async (data: ProductDto, images: string |null) => {
  if(images){
    data.images   = images;
  }
  data.categoryId = Number(data.categoryId);
  data.price      = Number(data.price);

  if(data.custom_price){
    data.custom_price = data.custom_price;
  }

  await productRepository.createProduct(data);
};

export const updateProduct = async (id:number, data: ProductDto, images: string |null) => {


  if(data.categoryId){
    data.categoryId = Number(data.categoryId);
  }

  if(data.price){
    data.price      = Number(data.price);
  }

  if(data.name){
    data.name = data.name;
  }

  if(data.description){
    data.description = data.description;
  }

  if(images){
    data.images   = images;
  }

  if(data.custom_price){
    data.custom_price = data.custom_price;
  }


  return await productRepository.updateProduct(id,data);
};

export const deleteProduct = async (id: number) => {
  return await productRepository.deleteProduct(id);
};

