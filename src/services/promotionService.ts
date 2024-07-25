import * as promotionRepository from '../repositories/PromotionRepository';
import { PromotionDto } from "../dto/promotion";


export const getAllPublicPromotions = async () => {
  const promotions = await promotionRepository.getAllPublicPromotions();
  return promotions.map((promotion) => ({
    title: promotion.title,
    description: promotion.description,
    images : JSON.parse(promotion.images ? promotion.images : '[]'),
    expiredDate : promotion.expiredDate,
    qtypeople: promotion.qtypeople,
    qtykids: promotion.qtykids,
    idtents: promotion.idtents,
    idproducts: promotion.idproducts,
    idexperiences: promotion.idexperiences,
    netImport:promotion.netImport,
    discount:promotion.discount,
    grossImport:promotion.grossImport,
    stock: promotion.stock
  }));
}

export const getAllPromotions = async () => {
  const promotions = await promotionRepository.getAllPromotions();
  promotions.forEach((promotion) => {
    promotion.images = JSON.parse(promotion.images ? promotion.images : '[]');
  });
  return promotions;
};

export const getPromotionById = async (id: number) => {
  return await promotionRepository.getPromotionById(id);
};

export const createPromotion = async (data: PromotionDto, images: string |null) => {
  if(images){
    data.images   = images;
  }
  data.stock          = Number(data.stock);
  data.qtypeople      = Number(data.qtypeople);
  data.qtykids        = Number(data.qtykids);
  data.netImport      = Number(data.netImport);
  data.discount       = Number(data.discount);
  data.grossImport    = Number(data.grossImport);

  await promotionRepository.createPromotion(data);
};

export const updatePromotion = async (id:number, data: PromotionDto, images: string |null) => {


  if(data.title){
    data.title   = data.title;
  }

  if(data.description){
    data.description   = data.description;
  }

  if(images){
    data.images   = images;
  }

  if(data.expireDate){
    data.expireDate   = data.expireDate;
  }

  if(data.status){
    data.status   = data.status;
  }

  if(data.qtypeople){
    data.qtypeople   = Number(data.qtypeople);
  }

  if(data.qtykids){
    data.qtykids   = Number(data.qtykids);
  }

  if(data.idtents){
    data.idtents   = data.idtents;
  }

  if(data.idproducts){
    data.idproducts   = data.idproducts;
  }

  if(data.idexperiences){
    data.idexperiences   = data.idexperiences;
  }

  if(data.netImport){
    data.netImport   = Number(data.netImport);
  }

  if(data.discount){
    data.discount   = Number(data.discount);
  }

  if(data.grossImport){
    data.grossImport   = Number(data.grossImport);
  }

  return await promotionRepository.updatePromotion(id,data);
};

export const deletePromotion = async (id: number) => {
  return await promotionRepository.deletePromotion(id);
};

