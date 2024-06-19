import * as reserveRepository from '../repositories/ReserveRepository';
import * as tentRepository from '../repositories/TentRepository';
import * as productRepository from '../repositories/ProductRepository';
import * as experienceRepository from '../repositories/ExperienceRepository';
import { ReserveDto } from "../dto/reserve";
import { Reserve, ReserveTent, ReserveProduct, ReserveExperience } from '@prisma/client';
import * as promotionRepository from '../repositories/PromotionRepository';
import * as utils from '../lib/utils';

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
    dateFrom: reserve.dateFrom,
    dateTo: reserve.dateTo,
    dateSale: reserve.dateSale,
    promotionId: reserve.promotionId,
    netImport: reserve.netImport,
    discount: reserve.discount,
    discountCodeId: reserve.discountCodeId,
    grossImport: reserve.grossImport,
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


export const createReserve = async (data: ReserveDto) => {
  if(!data.dateFrom)  throw new Error(" Input date From to create a Reserve");

  const checkInTime = new Date(data.dateFrom);
  checkInTime.setHours(12, 0, 0, 0);
  data.dateFrom = checkInTime;

  if(!data.dateTo) throw new Error(" Input date To to create a Reserve");

  const checkOutTime = new Date(data.dateTo);
  checkOutTime.setHours(12, 0, 0, 0);
  data.dateTo = checkOutTime;

  data.dateSale = new Date();
  data.qtypeople = Number(data.qtypeople);
  data.qtykids = Number(data.qtykids);
  data.discountCodeId = Number(data.discountCodeId);
  data.userId = Number(data.userId);



  if(!data.promotionId){

    const tentsDb = await utils.getTents(data.tents);
    // Check Availability
    const TentsAreAvialble = await utils.checkAvailability(checkInTime,checkOutTime,tentsDb);
    if(TentsAreAvialble){
      throw new Error ( "Tents have no Availability for the days selected");
    }

    const isRoomSizeCorrect = utils.checkRoomSize(tentsDb, data.qtypeople, data.qtykids, data.aditionalPeople);
    if(!isRoomSizeCorrect){
      throw new Error("The room size is not correct");
    }

    if(data.price_is_calculated){

        const productsDb = await utils.getProducts(data.products);

        const experiencesDb = await utils.getExperiences(data.experiences);

        data.netImport = utils.calculateReservePrice(tentsDb, productsDb, experiencesDb);

        data.grossImport = await utils.applyDiscount(data.netImport, data.discountCodeId);

    }else{

        data.grossImport = await utils.applyDiscount(data.netImport, data.discountCodeId);

    }

  }else{

    let promotion = await promotionRepository.getPromotionById(Number(data.promotionId));

    if (!promotion) {
      throw new Error(`Promotion with id ${data.promotionId} not found`);
    }

    if(promotion.stock || promotion.stock !== null){
      if(promotion.stock <= 0) throw new Error("Promotion is out of stock");
    }

    data.promotionId  = Number(promotion.id);
    data.qtypeople    = promotion.qtypeople;
    data.qtykids      = promotion.qtykids;
    data.netImport    = promotion.netImport;
    data.discount     = promotion.discount;
    data.grossImport  = promotion.grossImport;

    const tentsDb = await utils.getTents(promotion.idtents as any);
    // Check Availability
    const TentsAreAvialble = await utils.checkAvailability(checkInTime,checkOutTime,tentsDb);
    if(TentsAreAvialble){
      throw new Error ( "Tents have no Availability for the days selected");
    }

    data.tents = promotion.idtents as any;
    data.products = promotion.idproducts as any;
    data.experiences = promotion.idexperiences as any;

  }

  await reserveRepository.createReserve(data);
};

export const updateReserve = async (id:number, data: ReserveDto) => {
  return await reserveRepository.updateReserve(id,data);
};

export const deleteReserve = async (id: number) => {
  return await reserveRepository.deleteReserve(id);
};

