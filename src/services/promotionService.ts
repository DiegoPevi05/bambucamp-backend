import * as promotionRepository from '../repositories/PromotionRepository';
import * as tentRepository from '../repositories/TentRepository';
import * as experienceRepository from '../repositories/ExperienceRepository';
import * as productRepository from '../repositories/ProductRepository';

import { PromotionDto, PromotionFilters, PaginatedPromotions, PromotionOptions, PromotionPublicDto } from "../dto/promotion";
import { serializeImagesTodb, moveImagesToSubFolder, deleteSubFolder, deleteImages } from '../lib/utils';
import {BadRequestError, NotFoundError} from '../middleware/errors';


export const getAllPublicPromotions = async ():Promise<PromotionPublicDto[]> => {
  const promotions = await promotionRepository.getAllPublicPromotions();

  promotions.forEach((promotion) => {
    promotion.images = JSON.parse(promotion.images ? promotion.images : '[]');
    promotion.tents.forEach((tent)=>{
      tent.images = JSON.parse(tent.images ? tent.images : '[]');

    })

    promotion?.products?.forEach((product)=>{
      product.images = JSON.parse(product.images ? product.images : '[]');
    })

    promotion?.experiences?.forEach((experience)=>{
      experience.images = JSON.parse(experience.images ? experience.images : '[]');
    })

  });

  return promotions;
}

export const getAllPromotionOptions = async():Promise<PromotionOptions> => {
  const promotionOptions = await promotionRepository.getAllPromotionOptions();

  promotionOptions?.tents?.forEach((tent)=>{
    tent.images = JSON.parse(tent.images ? tent.images : '[]');

  })

  promotionOptions?.products?.forEach((product)=>{
    product.images = JSON.parse(product.images ? product.images : '[]');
  })

  promotionOptions?.experiences?.forEach((experience)=>{
    experience.images = JSON.parse(experience.images ? experience.images : '[]');
  })

  return promotionOptions;

}

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllPromotions = async (filters:PromotionFilters, pagination:Pagination):Promise<PaginatedPromotions> => {

  const PaginatedPromotions = await promotionRepository.getAllPromotions(filters,pagination);

  PaginatedPromotions.promotions.forEach((promotion) => {
    promotion.images = JSON.parse(promotion.images ? promotion.images : '[]');
    promotion.tents.forEach((tent)=>{
      tent.images = JSON.parse(tent.images ? tent.images : '[]');

    })

    promotion?.products?.forEach((product)=>{
      product.images = JSON.parse(product.images ? product.images : '[]');
    })

    promotion?.experiences?.forEach((experience)=>{
      experience.images = JSON.parse(experience.images ? experience.images : '[]');
    })

  });

  return PaginatedPromotions;
};

export const getPromotionById = async (id: number) => {
  return await promotionRepository.getPromotionById(id);
};

// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const createPromotion = async (data: PromotionDto, files: MulterFile[] | { [fieldname:string] :MulterFile[]; } | undefined) => {

  if(data.idtents){
    const idtents = JSON.parse(data.idtents)
    idtents.map((tentId:{id:number,label:string,qty:number,price:number})=>{
      const tent = tentRepository.getTentById(tentId.id);
      if(!tent){
        throw new NotFoundError("error.noAllTentsFound");
      }
    })
  }else{
    throw new BadRequestError("error.noTentsToValidate");
  }

  if(data.idproducts){
    const idproducts = JSON.parse(data.idproducts)
    idproducts.map((productId:{id:number,label:string,qty:number,price:number})=>{
      const product = productRepository.getProductById(productId.id);
      if(!product){
        throw new NotFoundError("error.noAllProductsFound");
      }
    })
  };

  if(data.idexperiences){
    const idexperiences = JSON.parse(data.idexperiences)
    idexperiences.map((experienceId:{id:number,label:string,qty:number,price:number})=>{
      const experience = experienceRepository.getExperienceById(experienceId.id);
      if(!experience){
        throw new NotFoundError("error.noAllExperiencesFound")
      }
    })
  };


 const images = serializeImagesTodb(files as { [fieldname: string]: MulterFile[] });

  if(images){
    data.images   = images;
  }

  data.stock          = Number(data.stock);
  data.qtypeople      = Number(data.qtypeople);
  data.qtykids        = Number(data.qtykids);
  data.netImport      = Number(data.netImport);
  data.discount       = Number(data.discount);
  data.grossImport    = Number(data.grossImport);

  if(data.expiredDate){
    const expiredDate = new Date(data.expiredDate);
    expiredDate.setUTCHours(5, 0, 0, 0);

    if(expiredDate < new Date()){
      throw new BadRequestError("error.expiredDateGreaterThanToday");
    }
    data.expiredDate = expiredDate;
  }

  const promotion = await promotionRepository.createPromotion(data);

  if(images){
    // Move images to the new folder
    const movedImages = await moveImagesToSubFolder(promotion.id, "promotions", JSON.parse(images || '[]'));

    await updatePromotionImages(promotion.id, JSON.stringify(movedImages));
  }

  return promotion;

};

export const updatePromotion = async (id:number, data: PromotionDto, files: MulterFile[] | { [fieldname:string] :MulterFile[]; } | undefined) => {

  const promotion = await promotionRepository.getPromotionById(id);

  if(!promotion){
    throw new NotFoundError("error.noPromotionFoundInDB");
  }

  if(data.title &&  data.title != promotion.title){
    promotion.title   = data.title;
  }

  if(data.description &&  data.description != promotion.description){
    promotion.description   = data.description;
  }

  if(data.expiredDate){
    const expiredDate = new Date(data.expiredDate);
    expiredDate.setUTCHours(5, 0, 0, 0);

    if(expiredDate < new Date()){
      throw new BadRequestError("error.expiredDateGreaterThanToday");
    }

    promotion.expiredDate = expiredDate;
  }

  if(data.status && data.status != promotion.status){
    promotion.status   = data.status;
  }

  if(data.stock &&  Number(data.stock) != promotion.stock ){
    promotion.stock = Number(data.stock);
  }

  if(data.qtypeople &&  Number(data.qtypeople) != promotion.qtypeople ){
    promotion.qtypeople = Number(data.qtypeople);
  }

  if(data.qtykids &&  Number(data.qtykids) != promotion.qtykids ){
    promotion.qtykids = Number(data.qtykids);
  }

  if(data.netImport && Number(data.netImport) != promotion.netImport){
    promotion.netImport   = Number(data.netImport);
  }

  if(data.discount && Number(data.discount) != promotion.discount){
    promotion.discount   = Number(data.discount);
  }

  if(data.grossImport && Number(data.grossImport) != promotion.grossImport){
    promotion.grossImport   = Number(data.grossImport);
  }

  if(data.idtents){
    const idtents = JSON.parse(data.idtents)
    idtents.map((tentId:{id:number,label:string,qty:number,price:number})=>{
      const tent = tentRepository.getTentById(tentId.id);
      if(!tent){
        throw new NotFoundError("error.noAllTentsFound")
      }
    })

    promotion.idtents = data.idtents; 
  }

  if(data.idproducts){
    const idproducts = JSON.parse(data.idproducts)
    idproducts.map((productId:{id:number,label:string,qty:number,price:number})=>{
      const product = productRepository.getProductById(productId.id);
      if(!product){
        throw new NotFoundError("error.noAllProductsFound")
      }
    })
    promotion.idproducts = data.idproducts;
  };

  if(data.idexperiences){
    const idexperiences = JSON.parse(data.idexperiences)
    idexperiences.map((experienceId:{id:number,label:string,qty:number,price:number})=>{
      const experience = experienceRepository.getExperienceById(experienceId.id);
      if(!experience){
        throw new NotFoundError("error.noAllExperiencesFound")
      }
    })
    promotion.idexperiences = data.idexperiences;
  };

  if(files || data.existing_images){

    
    let imagesToConserve:string[] = promotion.images ? JSON.parse(promotion.images) : [];
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

        imagesToConserve  = imagesToConserve.filter(dbImage => imageToReplace.includes(dbImage))
      }

    }

    let NewMovedImages:any[] = [];

    if(files){

      const imagesFiles = serializeImagesTodb(files as { [fieldname: string]: MulterFile[] });

      NewMovedImages = await moveImagesToSubFolder(promotion.id, "promotions", JSON.parse(imagesFiles || '[]'));

    }

    const allImages = [...imagesToConserve, ...NewMovedImages];

    const formattedImages = allImages.map(image => image.replace(/\//g, '\\'));

    promotion.images = JSON.stringify(formattedImages);
  }

  promotion.updatedAt = new Date();

  return await promotionRepository.updatePromotion(id,promotion);
};

export const deletePromotion = async (id: number) => {

  const promotion = await promotionRepository.getPromotionById(id);
  if (promotion?.images) {
      deleteSubFolder(promotion.id,"promotions");
  }
  return await promotionRepository.deletePromotion(id);
};


export const updatePromotionImages = async (promotionId: number, images: string) => {
  await promotionRepository.updatePromotionImages(promotionId, images);
};
