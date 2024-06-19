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
  data.discountCodeId = Number(data.discountCodeId);

  if(!data.tents) throw new Error( " Input at least one tent" );

  if(data.tents.length <= 0) throw new Error ("No tents to validate");

  const tentsIds = data.tents.map(tent => tent.tentId);
  const tentsDb = await tentRepository.getTentsByIds(tentsIds);

  const missingTentIds = tentsIds.filter(
    id => !tentsDb.some(tent => tent.id === id)
  );

  if (missingTentIds.length > 0) {
    throw new Error(`Tents with ids ${missingTentIds.join(', ')} not found`);
  }

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

      const productsIds = data.products.map(product => product.productId);
      const productsDb = await productRepository.getProductsByIds(productsIds);

      const missingProductIds = productsIds.filter(
        id => !productsDb.some(product => product.id === id)
      );

      if (missingProductIds.length > 0) {
        throw new Error(`Products with ids ${missingProductIds.join(', ')} not found`);
      }
      
      const experiencesIds = data.experiences.map(experience => experience.experienceId);
      const experiencesDb = await experienceRepository.getExperiencesByIds(experiencesIds);

      const missingExperienceIds = experiencesIds.filter(
        id => !experiencesDb.some(experience => experience.id === id)
      );

      if (missingExperienceIds.length > 0) {
        throw new Error(`Experiences with ids ${missingExperienceIds.join(', ')} not found`);
      }


      const calculateTentsPrice = tentsDb.reduce((acc, tent) => acc + utils.calculatePrice(tent.price,tent.custom_price), 0);

      const calculateProductsPrice = productsDb.reduce((acc, product) => acc + utils.calculatePrice(product.price,product.custom_price), 0);

      const calculateExperiencesPrice = experiencesDb.reduce((acc, experience) => acc + utils.calculatePrice(experience.price,experience.custom_price), 0);

      data.netImport = calculateTentsPrice + calculateProductsPrice + calculateExperiencesPrice;

      data.grossImport = await utils.applyDiscount(data.netImport, data.discountCodeId);

  }else{

      data.grossImport = await utils.applyDiscount(data.netImport, data.discountCodeId);

  }

  /*&let promotion = null;
  if (data.promotionId) {
    promotion = await promotionRepository.getPromotionById(data.promotionId);
    if (!promotion) {
      throw new Error(`Promotion with id ${data.promotionId} not found`);
    }
  }*/
  await reserveRepository.createReserve(data);
};

export const updateReserve = async (id:number, data: ReserveDto) => {
  return await reserveRepository.updateReserve(id,data);
};

export const deleteReserve = async (id: number) => {
  return await reserveRepository.deleteReserve(id);
};

