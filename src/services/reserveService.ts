import * as reserveRepository from '../repositories/ReserveRepository';
import { ReserveDto } from "../dto/reserve";
import { Reserve, ReserveTent, ReserveProduct, ReserveExperience } from '@prisma/client';

export interface ExtendedReserve extends Reserve {
  tents: ReserveTent[];
  products: ReserveProduct[];
  experiences: ReserveExperience[];
}

export const getAllMyReserves = async (userId:number) => {
  const reserves = await reserveRepository.getMyReserves(userId);
  return reserves.map((reserve:ExtendedReserve) => ({
    qtypeople: reserve.qtypeople,
    qtykids: reserve.qtykids,
    userId: reserve.userId,
    tents: reserve.tents,
    products: reserve.products,
    experiences: reserve.experiences,
    amountTotal: reserve.amountTotal,
    dateFrom: reserve.dateFrom,
    dateTo: reserve.dateTo,
    dateSale: reserve.dateSale,
    promotionId: reserve.promotionId,
    payAmountTotal: reserve.payAmountTotal,
    paymentStatus: reserve.paymentStatus,
    aditionalPeople: reserve.aditionalPeople
  }));
}

export const getAllReserves = async () => {
  return await reserveRepository.getAllReserves();
};

export const getReserveById = async (id: number) => {
  return await reserveRepository.getReserveById(id);
};

export const createReserve = async (data: ReserveDto, images: string |null) => {
  if(images){
    data.images   = images;
  }
  data.stock          = Number(data.stock);
  data.qtypeople      = Number(data.qtypeople);
  data.qtykids        = Number(data.qtykids);
  data.netImport      = Number(data.netImport);
  data.discount       = Number(data.discount);
  data.grossImport    = Number(data.grossImport);

  await reserveRepository.createReserve(data);
};

export const updateReserve = async (id:number, data: ReserveDto, images: string |null) => {


  if(data.code){
    data.code   = data.code;
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

  return await reserveRepository.updateReserve(id,data);
};

export const deleteReserve = async (id: number) => {
  return await reserveRepository.deleteReserve(id);
};

