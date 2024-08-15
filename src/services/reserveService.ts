import * as reserveRepository from '../repositories/ReserveRepository';
import { PaginatedReserve, ReserveDto, ReserveFilters, ReserveTentDto,ReserveProductDto,ReserveExperienceDto, ReserveOptions } from "../dto/reserve";
import * as promotionRepository from '../repositories/PromotionRepository';
import *  as userRepository from '../repositories/userRepository';
import * as utils from '../lib/utils';
import { BadRequestError, NotFoundError } from "../middleware/errors";

export const searchAvailableTents = async (dateFrom: Date, dateTo: Date) => {
  return await reserveRepository.searchAvailableTents(dateFrom, dateTo);
};

export const getAllMyReserves = async (userId:number) => {
  return await reserveRepository.getMyReserves(userId);
}

export const getAllReseveOptions = async():Promise<ReserveOptions> => {
  const reserveOptions = await reserveRepository.getAllReserveOptions();

  reserveOptions?.tents?.forEach((tent)=>{
    tent.images = JSON.parse(tent.images ? tent.images : '[]');

  })

  reserveOptions?.products?.forEach((product)=>{
    product.images = JSON.parse(product.images ? product.images : '[]');
  })

  reserveOptions?.experiences?.forEach((experience)=>{
    experience.images = JSON.parse(experience.images ? experience.images : '[]');
  })

  reserveOptions?.promotions?.forEach((promotion)=>{
    promotion.images = JSON.parse(promotion.images ? promotion.images : '[]');
  })

  return reserveOptions;

}

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllReserves = async (filters:ReserveFilters, pagination:Pagination):Promise<PaginatedReserve> => {
  return await reserveRepository.getAllReserves(filters,pagination);
};

export const getReserveById = async (id: number) => {
  return await reserveRepository.getReserveById(id);
};

export const createReserveByUser = async (data: ReserveDto, userId: number) => {
  data.userId = userId;
  data.price_is_calculated = true;
  await createReserve(data);
};


export const createReserve = async (data: ReserveDto) => {
  if(!data.dateFrom) throw new BadRequestError("Input date From to create a Reserve")

  const checkInTime = new Date(data.dateFrom);
  checkInTime.setUTCHours(17, 0, 0, 0);
  data.dateFrom = checkInTime;

  if(!data.dateTo) throw new BadRequestError(" Input date To to create a Reserve");

  const checkOutTime = new Date(data.dateTo);
  checkOutTime.setUTCHours(17, 0, 0, 0);
  data.dateTo = checkOutTime;


  data.dateSale = new Date();
  data.qtypeople = Number(data.qtypeople);
  data.qtykids = Number(data.qtykids);
  data.discountCodeId = Number(data.discountCodeId);
  data.userId = Number(data.userId);


  if(data.promotionId == undefined ||  data.promotionId == null  || data.promotionId == 0){

    const tentsDb = await utils.getTents(data.tents);
    // Check Availability
    const TentsAreAvialble = await utils.checkAvailability(checkInTime,checkOutTime,tentsDb);
    if(!TentsAreAvialble){
      throw new BadRequestError("Tents have no Availability for the days selected");
    }

    const isRoomSizeCorrect = utils.checkRoomSize(tentsDb, data.qtypeople, data.qtykids, data.aditionalPeople);
    if(!isRoomSizeCorrect){
      throw new BadRequestError("The room size is not correct");
    }

    if(data.price_is_calculated){

        const productsDb = await utils.getProducts(data.products);

        const experiencesDb = await utils.getExperiences(data.experiences);

        // Map quantities to the respective tents, products, and experiences
        const tentsWithQuantities = tentsDb.map(tent => ({
          tent,
          quantity: data.tents.find(t => t.idTent === tent.id)?.quantity || 1
        }));

        const productsWithQuantities = productsDb.map(product => ({
          product,
          quantity: data.products.find(p => p.idProduct === product.id)?.quantity || 1
        }));

        const experiencesWithQuantities = experiencesDb.map(experience => ({
          experience,
          quantity: data.experiences.find(e => e.idExperience === experience.id)?.quantity || 1
        }));

        // Calculate total price
        data.netImport = utils.calculateReservePrice(tentsWithQuantities, productsWithQuantities, experiencesWithQuantities);

        data.grossImport = await utils.applyDiscount(data.netImport, data.discountCodeId);

    }else{

        data.grossImport = await utils.applyDiscount(data.netImport, data.discountCodeId, data.discount);

    }

  }else{

    let promotion = await promotionRepository.getPromotionById(Number(data.promotionId));

    if (!promotion) {
      throw new NotFoundError(`Promotion not found`);
    }

    if(promotion.expiredDate){
      if(promotion.expiredDate < new Date()){
        throw new BadRequestError("Promotion is expired");
      }
    }

    if(promotion.stock || promotion.stock !== null){
      if(promotion.stock <= 0) throw new BadRequestError("Promotion is out of stock");
    }

    data.promotionId  = Number(promotion.id);
    data.qtypeople    = promotion.qtypeople;
    data.qtykids      = promotion.qtykids;
    data.netImport    = promotion.netImport;
    data.discount     = promotion.discount;
    data.grossImport  = promotion.grossImport;


    const idtents = JSON.parse(promotion.idtents) as { id:number; label:string; qty:number; price:number; }[];
    const idproducts = JSON.parse(promotion.idproducts) as { id:number; label:string; qty:number; price:number; }[];
    const idexperiences = JSON.parse(promotion.idtents) as { id:number; label:string; qty:number; price:number; }[];

    // Convert idtents to ReserveTent structure
    const promotionTents:ReserveTentDto[] = idtents.map(tent => ({
      idTent: tent.id,
      name: tent.label,
      price: tent.price,
      quantity: tent.qty,
    }));

    const tentsDb = await utils.getTents(promotionTents);
    if(tentsDb.length != promotionTents.length){
      throw new NotFoundError("Not found all Tents in promotion");
    }
    // Check Availability
    const TentsAreAvialble = await utils.checkAvailability(checkInTime,checkOutTime,tentsDb);
    if(!TentsAreAvialble){
      throw new BadRequestError("Tents have no Availability for the days selected");
    }

    // Convert idproducts to ReserveProduct structure
    const promotionProducts:ReserveProductDto[] = idproducts.map(product => ({
      idProduct: product.id,
      name: product.label,
      price: product.price,
      quantity: product.qty,
    }));

    await utils.getProducts(promotionProducts);

    // Convert idexperiences to ReserveExperience structure
    const promotionExperiences:ReserveExperienceDto[] = idexperiences.map(experience => ({
      idExperience: experience.id,
      name: experience.label,
      price: experience.price,
      quantity: experience.qty,
    }));

    await utils.getExperiences(promotionExperiences);

    data.tents = promotionTents;
    data.products = promotionProducts;
    data.experiences = promotionExperiences;


    await promotionRepository.updatePromotionStock(promotion.id,promotion.stock - 1);

  }

  await reserveRepository.createReserve(data);
};

export const updateReserve = async (id:number, data: ReserveDto) => {

  const reserve = await reserveRepository.getReserveById(id);

  if(!reserve){
    throw new NotFoundError('The reserve is not found in the database.');
  }


  const user = await userRepository.getUserById(data.userId);

  if(!user){
    throw new NotFoundError('The user in the database does not exist.');
  }

  if(reserve.userId != user.id){
    reserve.userId = user.id;
  }

  if(!data.dateFrom)  throw new BadRequestError(" Input date From to create a Reserve");

  let checkInTime = new Date();

  if(new Date(data.dateFrom) != reserve.dateFrom){
    checkInTime = new Date(data.dateFrom)
    checkInTime.setHours(12, 0, 0, 0);
    reserve.dateFrom = checkInTime;
  }else{
    checkInTime = new Date(reserve.dateFrom);
  }

  if(!data.dateTo) throw new BadRequestError(" Input date To to create a Reserve");

  let checkOutTime = new Date(data.dateTo);

  if(new Date(data.dateTo) != reserve.dateTo){
    checkOutTime = new Date(data.dateTo)
    checkOutTime.setHours(12, 0, 0, 0);
    reserve.dateTo = checkInTime;
  }else{
    checkOutTime = new Date(reserve.dateFrom);
  }

  if(data.qtypeople &&  Number(data.qtypeople) != reserve.qtypeople ){
    reserve.qtypeople = Number(data.qtypeople);
  }

  if(data.qtykids &&  Number(data.qtykids) != reserve.qtykids ){
    reserve.qtykids = Number(data.qtykids);
  }

  if(data.aditionalPeople &&  Number(data.aditionalPeople) != reserve.aditionalPeople ){
    reserve.aditionalPeople = Number(data.aditionalPeople);
  }

  if(data.canceled_reason &&  data.canceled_reason != reserve.canceled_reason ){
    reserve.canceled_reason = data.canceled_reason;
  }

  if(data.canceled_status &&  data.canceled_status != reserve.canceled_status ){
    reserve.canceled_status = data.canceled_status;
  }

  if(data.paymentStatus &&  data.paymentStatus != reserve.paymentStatus ){
    reserve.paymentStatus = data.paymentStatus;
  }


  if(data.promotionId == undefined ||  data.promotionId == null  || data.promotionId == 0){

    const tentsDb = await utils.getTents(data.tents);
    // Check Availability
    const TentsAreAvialble = await utils.checkAvailability(checkInTime,checkOutTime,tentsDb);
    if(!TentsAreAvialble){
      throw new BadRequestError( "Tents have no Availability for the days selected");
    }

    const isRoomSizeCorrect = utils.checkRoomSize(tentsDb, data.qtypeople, data.qtykids, data.aditionalPeople);
    if(!isRoomSizeCorrect){
      throw new BadRequestError("The room size is not correct");
    }

    reserve.price_is_calculated = data.price_is_calculated;

    reserve.discountCodeId      = data.discountCodeId;

    if(data.price_is_calculated){

        const productsDb = await utils.getProducts(data.products);

        const experiencesDb = await utils.getExperiences(data.experiences);

        // Map quantities to the respective tents, products, and experiences
        const tentsWithQuantities = tentsDb.map(tent => ({
          tent,
          quantity: data.tents.find(t => t.idTent === tent.id)?.quantity || 1
        }));

        const productsWithQuantities = productsDb.map(product => ({
          product,
          quantity: data.products.find(p => p.idProduct === product.id)?.quantity || 1
        }));

        const experiencesWithQuantities = experiencesDb.map(experience => ({
          experience,
          quantity: data.experiences.find(e => e.idExperience === experience.id)?.quantity || 1
        }));

        // Calculate total price
        reserve.netImport = utils.calculateReservePrice(tentsWithQuantities, productsWithQuantities, experiencesWithQuantities);

        reserve.grossImport = await utils.applyDiscount(data.netImport, data.discountCodeId);

    }else{

        reserve.grossImport = await utils.applyDiscount(data.netImport, data.discountCodeId);

    }

    reserveRepository.upsertReserveDetails(reserve.id,data.tents,data.products,data.experiences);

  }else if(Number(data.promotionId) != reserve.promotionId){

    let promotion = await promotionRepository.getPromotionById(Number(data.promotionId));

    if (!promotion) {
      throw new NotFoundError(`Promotion not found`);
    }

    if(promotion.expiredDate){
      if(promotion.expiredDate < new Date()){
        throw new BadRequestError("Promotion is expired");
      }
    }

    if(promotion.stock || promotion.stock !== null){
      if(promotion.stock <= 0) throw new BadRequestError("Promotion is out of stock");
    }

    reserve.promotionId  = Number(promotion.id);
    reserve.qtypeople    = promotion.qtypeople;
    reserve.qtykids      = promotion.qtykids;
    reserve.netImport    = promotion.netImport;
    reserve.discount     = promotion.discount;
    reserve.grossImport  = promotion.grossImport;

    const tentsDb = await utils.getTents(promotion.idtents as any);
    // Check Availability
    const TentsAreAvialble = await utils.checkAvailability(checkInTime,checkOutTime,tentsDb);
    if(TentsAreAvialble){
      throw new BadRequestError( "Tents have no Availability for the days selected");
    }

    const idtents = JSON.parse(promotion.idtents) as { id:number; label:string; qty:number; price:number; }[];
    const idproducts = JSON.parse(promotion.idproducts) as { id:number; label:string; qty:number; price:number; }[];
    const idexperiences = JSON.parse(promotion.idtents) as { id:number; label:string; qty:number; price:number; }[];

    // Convert idtents to ReserveTent structure
    const reserveTents:ReserveTentDto[] = idtents.map(tent => ({
      idTent: tent.id,
      name: tent.label,
      price: tent.price,
      quantity: tent.qty,
    }));

    // Convert idproducts to ReserveProduct structure
    const reserveProducts:ReserveProductDto[] = idproducts.map(product => ({
      idProduct: product.id,
      name: product.label,
      price: product.price,
      quantity: product.qty,
    }));

    // Convert idexperiences to ReserveExperience structure
    const reserveExperiences:ReserveExperienceDto[] = idexperiences.map(experience => ({
      idExperience: experience.id,
      name: experience.label,
      price: experience.price,
      quantity: experience.qty,
    }));

    // Now pass these to your upsert function
    reserveRepository.upsertReserveDetails(reserve.id, reserveTents, reserveProducts, reserveExperiences);

  }

  return await reserveRepository.updateReserve(id,reserve);
};

export const deleteReserve = async (id: number) => {
  return await reserveRepository.deleteReserve(id);
};

