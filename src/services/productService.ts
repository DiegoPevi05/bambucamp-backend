import * as productRepository from '../repositories/ProductRepository';
import * as utils from '../lib/utils';
import { ProductDto, ProductFilters, PaginatedProducts, PublicProduct } from "../dto/product";
import { deleteSubFolder, serializeImagesTodb, moveImagesToSubFolder, deleteImages } from '../lib/utils';
import {NotFoundError} from '../middleware/errors';


export const getAllPublicProducts = async (categories?:string[]) => {
  const products = await productRepository.getAllPublicProducts(categories);

  const ProductsPublic:PublicProduct[]  = [] 

  products.forEach((product) => {
    let productPublic:PublicProduct = {
      id:product.id,
      categoryId: product.categoryId,
      category:product.category,
      name: product.name,
      description: product.description,
      price: product.price,
      images : JSON.parse(product.images ? product.images : '[]'),
      custom_price: product.custom_price != undefined ? utils.calculatePrice(product.price,product.custom_price) :product.price 
    }
    ProductsPublic.push(productPublic);
  });

  return ProductsPublic;

};

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllProducts = async (filters: ProductFilters, pagination: Pagination): Promise<PaginatedProducts> => {
  const productsPaginated = await productRepository.getAllProducts(filters,pagination);
  productsPaginated.products.forEach((product) => {
    product.images = JSON.parse(product.images ? product.images : '[]');
  });
  return productsPaginated;
};

export const getProductById = async (id: number) => {
  return await productRepository.getProductById(id);
};


// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const createProduct = async (data: ProductDto, files: MulterFile[] | { [fieldname:string] :MulterFile[]; } | undefined) => {

 const images = serializeImagesTodb(files as { [fieldname: string]: MulterFile[] });

  if(images){
    data.images   = images;
  }
  data.categoryId     = Number(data.categoryId);
  data.price          = Number(data.price);
  data.stock       = Number(data.stock);

  const product = await productRepository.createProduct(data);

  if(images){
    // Move images to the new folder
    const movedImages = await moveImagesToSubFolder(product.id, "products", JSON.parse(images || '[]'));

    await updateProductImages(product.id, JSON.stringify(movedImages));
  }

  return product;


};

export const updateProduct = async (id:number, data: ProductDto, files: MulterFile[] | { [fieldname:string] :MulterFile[]; } | undefined) => {


  const product = await productRepository.getProductById(id);

  if(!product){
    throw new NotFoundError("error.noProductFoundInDB");
  }

  if(data.categoryId &&  Number(data.categoryId) != product.categoryId ){
    product.categoryId = Number(data.categoryId);
  }

  if(data.name &&  data.name != product.name){
    product.name   = data.name;
  }

  if(data.description &&  data.description != product.description){
    product.description   = data.description;
  }

  if(data.stock &&  Number(data.stock) != product.stock ){
    product.stock = Number(data.stock);
  }

  if(files || data.existing_images){

    
    let imagesToConserve:string[] = product.images ? JSON.parse(product.images) : [];
    // Normalize paths to use forward slashes
    imagesToConserve = imagesToConserve.map(image => image.replace(/\\/g, '/'));

    if(data.existing_images){

      const imageToReplace: string[] = data.existing_images ? JSON.parse(data.existing_images) : [];

      if (imageToReplace.length >= 0  && imagesToConserve.length != imageToReplace.length ) {
        // Find the images that need to be removed
        const imagesToRemove = imagesToConserve.filter(dbImage => !imageToReplace.includes(dbImage));
        // Perform the removal of images
        if (imagesToRemove.length > 0) {
          deleteImages(imagesToRemove);
        }

        imagesToConserve  = imagesToConserve.filter(dbImage => imageToReplace.includes(dbImage));
      }

    }

    let NewMovedImages:any[] = [];

    if(files){

      const imagesFiles = serializeImagesTodb(files as { [fieldname: string]: MulterFile[] });

      NewMovedImages = await moveImagesToSubFolder(product.id, "products", JSON.parse(imagesFiles || '[]'));

    }

    const allImages = [...imagesToConserve, ...NewMovedImages];

    const formattedImages = allImages.map(image => image.replace(/\//g, '\\'));
    // Store the images in the desired format
    product.images = JSON.stringify(formattedImages);
  }

  if(data.status && data.status != product.status){
    product.status   = data.status;
  }

  if(data.custom_price && data.custom_price != product.custom_price){
    product.custom_price = data.custom_price;
  }

  product.updatedAt = new Date();

  return await productRepository.updateProduct(id,product);
};

export const deleteProduct = async (id: number) => {
  const product = await productRepository.getProductById(id);
  if (product?.images) {
      deleteSubFolder(product.id,"products");
  }
  return await productRepository.deleteProduct(id);
};


export const updateProductImages = async (productId: number, images: string) => {
  await productRepository.updateProductImages(productId, images);
};

export const checkProductStock = async(idProduct:number, quantity:number ):Promise<boolean> => {

  const product = await productRepository.getProductById(idProduct);

  if(!product){
    throw new NotFoundError("error.noProductFoundInDB");
  }

  if(product.stock >= quantity){
    const newStock = product.stock - quantity;
    await productRepository.updateStock(product.id,newStock);
    return true;
  }

  return false;

}
