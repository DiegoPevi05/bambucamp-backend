import * as reserveRepository from '../repositories/ReserveRepository';
import { PaginatedReserve, ReserveDto, ReserveEntityType, ReserveExperienceDto, ReserveFilters, ReserveFormDto, ReserveOptions, ReserveProductDto, ReservePromotionDto, ReserveTentDto, createReserveExperienceDto, createReserveProductDto } from "../dto/reserve";
import * as promotionRepository from '../repositories/PromotionRepository';
import *  as userRepository from '../repositories/userRepository';
import * as productService from './productService';
import * as experienceService from './experienceService';
import * as authService from './authService';
import * as utils from '../lib/utils';
import { BadRequestError, NotFoundError, UnauthorizedError } from "../middleware/errors";
import {sendNewReservationEmailUser,sendNewReservationEmailAdmin} from '../config/email/mail';
import { PaymentStatus, Reserve, ReserveStatus, Role, User} from '@prisma/client';
import { calculatePrice } from '../lib/utils';
import {PublicTent} from '../dto/tent';
import {generateSalesNote} from '../config/receipt/pdf';

interface Pagination {
  page: number;
  pageSize: number;
}

export const getCalendarDates = async(page:number) => {
  return await reserveRepository.getCalendarDates(page);
}

export const searchAvailableTents = async (dateFromInput:string,dateToInput:string) => {
  const dateFrom = new Date(dateFromInput);
  const dateTo = new Date(dateToInput);
  const tents = await reserveRepository.searchAvailableTents(dateFrom, dateTo);

  const TentsPublic:PublicTent[]  = [] 

  tents.forEach((tent) => {

    let tentPublic:PublicTent = { 
      ...tent, 
      images: JSON.parse(tent.images ? tent.images : '[]'),
      custom_price: calculatePrice(tent.price,tent.custom_price) 
    }
    TentsPublic.push(tentPublic);
  });

  return TentsPublic;
};

export const searchAdminAvailableTents = async (dateFromInput:string,dateToInput:string) => {
  const dateFrom = new Date(dateFromInput);
  const dateTo = new Date(dateToInput);
  const tents = await reserveRepository.searchAvailableTents(dateFrom, dateTo);

  tents.forEach((tent) => {
    tent.images = JSON.parse(tent.images ? tent.images : '[]');
  });

  return tents;
};

export const getAllMyReservesCalendarUser = async(page:number,userId:number) => {
  return await reserveRepository.getMyReservesByMonth(page,userId);
}

export const getAllMyReservesCalendar = async(page:number,userId?:number) => {
  return await reserveRepository.getMyReservesByMonth(page,userId);
}

export const getAllMyReservesUser = async (pagination: Pagination, userId: number) => {
  const MyReserves = await reserveRepository.getMyReserves(pagination, userId);

  if (MyReserves?.reserves) {
    utils.parseImagesInReserves(MyReserves.reserves);
  }

  return MyReserves;
};

export const getAllMyReserves = async (pagination: Pagination, userId?: number) => {
  const MyReserves = await reserveRepository.getMyReserves(pagination, userId);

  if (MyReserves?.reserves) {
    utils.parseImagesInReserves(MyReserves.reserves);
  }

  return MyReserves;
};

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



export const getAllReserves = async (filters:ReserveFilters, pagination:Pagination):Promise<PaginatedReserve> => {
  return await reserveRepository.getAllReserves(filters,pagination);
};

export const getReserveById = async (id: number) => {
  return await reserveRepository.getReserveById(id);
};

export const createReserveByUser = async (data: ReserveFormDto, language:string) => {

  data.price_is_calculated = true;
  data.payment_status = PaymentStatus.UNPAID;
  data.reserve_status = ReserveStatus.NOT_CONFIRMED; 
  const reserve = await createReserve(data, language);

  if(reserve == null){
    throw new BadRequestError("error.failedToCreateReserve")
  }

  await sendNewReservationEmailUser({ email:data.user_email ?? "", firstName:data.user_firstname ?? ""},reserve, language );

  await sendNewReservationEmailAdmin({ email:data.user_email ?? "", firstName:data.user_firstname ?? ""}, reserve ,language );

};


export const createReserve = async (data: ReserveFormDto, language:string):Promise<ReserveDto|null> => {

  let reserveDto:ReserveDto = {
    userId:0,
    eta: new Date(),
    external_id:"",
    dateSale: new Date(),
    tents:[],
    experiences:[],
    products:[],
    promotions:[],
    price_is_calculated:true,
    discount_code_id:0,
    discount_code_name:"",
    net_import:0,
    discount:0,
    gross_import:0,
    canceled_reason:"",
    canceled_status:false,
    payment_status:PaymentStatus.UNPAID,
    reserve_status:ReserveStatus.CONFIRMED,
  };


  let user = await authService.createReserveUser(data);

  reserveDto.userId           = user.id;



  reserveDto.tents            = utils.normalizeTimesInTents(data.tents);
  reserveDto.experiences      = utils.normalizeTimesInExperience(data.experiences);
  reserveDto.products         = data.products;

  if(data.eta) reserveDto.eta = new Date(data.eta);
  if(data.reserve_status) reserveDto.reserve_status = data.reserve_status;
  if(data.payment_status) reserveDto.payment_status = data.payment_status;
  if(data.canceled_reason) reserveDto.canceled_reason = data.canceled_reason;
  if(data.canceled_status) reserveDto.canceled_status = data.canceled_status;
  if(data.price_is_calculated) reserveDto.price_is_calculated = data.price_is_calculated;
  if(data.discount_code_id) reserveDto.discount_code_id = Number(data.discount_code_id);
  if(data.discount_code_name) reserveDto.discount_code_name = data.discount_code_name; 
  if(data.gross_import) reserveDto.gross_import = Number(data.gross_import);
  if(data.discount) reserveDto.discount = Number(data.discount);
  if(data.net_import) reserveDto.net_import = Number(data.net_import);


  if(data.promotions.length > 0){
    const { tents, products, experiences, promotions  } = await utils.getPromotionItems(data.promotions); 

    if(tents.length > 0) reserveDto.tents = [...reserveDto.tents, ...tents]; 
    if(products.length > 0) reserveDto.products = [...reserveDto.products, ...products];
    if(experiences.length > 0) reserveDto.experiences = [...reserveDto.experiences, ...experiences];
    if(promotions.length > 0) reserveDto.promotions = promotions;

    await promotionRepository.reducePromotionStock(data.promotions);
  }

  const tentsDb = await utils.getTents(data.tents);

  const productsDb = await utils.getProducts(data.products);

  const experiencesDb = await utils.getExperiences(data.experiences);
  
  // Check Availability
  const TentsAreAvialble = await utils.checkAvailability(data.tents);

  if(!TentsAreAvialble){
    throw new BadRequestError("error.noTentsAvailable");
  }

  const tentsDbMap = new Map(tentsDb.map(tent => [tent.id, tent]));

  reserveDto.tents = reserveDto.tents.map(tent => {
    const foundTent = tentsDbMap.get(tent.idTent);
    if (!foundTent) {
      throw new NotFoundError("error.noAllTentsFound");
    }
    const basePricePerNight = calculatePrice(foundTent.price, foundTent.custom_price);
    tent.name = tent.name ?? foundTent.title;
    tent.price = basePricePerNight;
    tent.nights = Number(tent.nights ?? 0);
    tent.aditionalPeople = Number(tent.aditionalPeople ?? 0);
    tent.aditionalPeoplePrice = foundTent.aditional_people_price;
    tent.kids = Number(tent.kids ?? 0);
    tent.kidsPrice = Number(tent.kidsPrice ?? 0);
    return tent;
  });

  const tentsWithQuantities = reserveDto.tents.map(tent => {
    const foundTent = tentsDbMap.get(tent.idTent);
    if (!foundTent) {
      throw new NotFoundError("error.noAllTentsFound");
    }
    return {
      tent: foundTent,
      nights: Number(tent.nights ?? 0),
      aditionalPeople: tent.aditionalPeople,
      kids: tent.kids,
    };
  });

  const productsWithQuantities = data.products.map(product => {
    const foundProduct = productsDb.find(p => p.id === product.idProduct);
    if (!foundProduct) {
      throw new NotFoundError("error.noAllProductsFound");
    }
    return {
      product: foundProduct,
      quantity: product.quantity
    };
  });

  const experiencesWithQuantities = data.experiences.map(experience => {
    const foundExperience = experiencesDb.find(e => e.id === experience.idExperience);
    if (!foundExperience) {
      throw new NotFoundError("error.noAllExperiencesFound");
    }
    return {
      experience: foundExperience,
      quantity: experience.quantity
    };
  });

  const promotionWithQuantities = data.promotions.map(promotion => ({
    promotionId: promotion.idPromotion,
    price: promotion.price
  }));

  const priceComputation = utils.calculateReservePrice(
    tentsWithQuantities,
    productsWithQuantities,
    experiencesWithQuantities,
    promotionWithQuantities
  );

  if(data.price_is_calculated){

      reserveDto.gross_import = priceComputation.total;

      const { netImport, discount, discount_name } = await utils.applyDiscount(reserveDto.gross_import, data.discount_code_id);
      reserveDto.discount_code_id = data.discount_code_id;
      reserveDto.discount_code_name = discount_name != null ? discount_name : "";
      reserveDto.discount = discount;
      reserveDto.net_import = netImport;

  }else{
      const { netImport, discount, discount_name } = await utils.applyDiscount(data.gross_import, data.discount_code_id, data.discount);
      reserveDto.discount_code_id = data.discount_code_id;
      reserveDto.gross_import = data.gross_import;
      reserveDto.discount_code_name = discount_name != null ? discount_name : "";
      reserveDto.discount = discount;
      reserveDto.net_import = netImport;

  }

  const tentBreakdown = priceComputation.tentBreakdown;
  reserveDto.tents = reserveDto.tents.map(tent => {
    const breakdown = tentBreakdown.find(detail => detail.idTent === tent.idTent);
    if (breakdown) {
      tent.aditionalPeople = breakdown.aditionalPeople;
      tent.aditionalPeoplePrice = breakdown.aditionalPeoplePrice;
      tent.kids = breakdown.kids;
      tent.kidsPrice = breakdown.kidsPricePerNight;
      tent.price = breakdown.basePricePerNight;
    }
    return tent;
  });
  
  const reserve = await reserveRepository.createReserve(reserveDto);

  if(reserveDto.reserve_status == ReserveStatus.CONFIRMED && reserve &&  reserve.id){
    await authService.confirmReservation(reserve.id,language);

  }

  return reserve;
};

export const updateReserve = async (id:number, data: ReserveFormDto) => {

  const reserve = await reserveRepository.getReserveById(id);

  if(!reserve){
    throw new NotFoundError('error.noReservefoundInDB');
  }

  const user = await userRepository.getUserById(data.userId);

  if(!user){
    throw new NotFoundError('error.noUserFoundInDB');
  }

  if(reserve.userId != user.id){
    reserve.userId = user.id;
  }

  if(data.eta && reserve.eta != data.eta){
    reserve.eta         = new Date(data.eta);
  }

  if(data.reserve_status && reserve.reserve_status != data.reserve_status){
    reserve.reserve_status = data.reserve_status;
  } 

  if(data.payment_status && reserve.payment_status != data.payment_status){
    reserve.payment_status = data.payment_status;
  }

  if(data.discount_code_id && reserve.discount_code_id != Number(data.discount_code_id)){
    reserve.discount_code_id = Number(data.discount_code_id);
  }

  if(data.discount_code_name && reserve.discount_code_name != data.discount_code_name){
    reserve.discount_code_name = data.discount_code_name;
  }

  if(data.price_is_calculated && reserve.price_is_calculated != data.price_is_calculated){
    reserve.price_is_calculated = data.price_is_calculated;
  }

  if(data.gross_import && reserve.gross_import != Number(data.gross_import)){
    reserve.gross_import = Number(data.gross_import);
  } 

  if(data.discount && reserve.discount != Number(data.discount)){
    reserve.discount = Number(data.discount);
  } 

  if(data.net_import && reserve.net_import != Number(data.net_import)){
    reserve.net_import = Number(data.net_import);
  } 

  let reserve_tents:ReserveTentDto[] = [];
  let reserve_products:ReserveProductDto[] = [];
  let reserve_experiences:ReserveExperienceDto[] = [];
  let reserve_promotions:ReservePromotionDto[] = [];

  reserve_tents            = utils.normalizeTimesInTents(data.tents);
  reserve_experiences      = utils.normalizeTimesInExperience(data.experiences);
  reserve_products         = data.products;

  if(data.promotions.length > 0){
    const { tents, products, experiences, promotions  } = await utils.getPromotionItems(data.promotions); 

    if(tents.length > 0) reserve_tents = [...reserve_tents, ...tents]; 
    if(products.length > 0) reserve_products = [...reserve_products, ...products];
    if(experiences.length > 0) reserve_experiences = [...reserve_experiences, ...experiences];
    if(promotions.length > 0) reserve_promotions = promotions;

    await promotionRepository.reducePromotionStock(data.promotions);
  }


  const tentsDb = await utils.getTents(data.tents);

  const productsDb = await utils.getProducts(data.products);

  const experiencesDb = await utils.getExperiences(data.experiences);
  
  // Check Availability
  const TentsAreAvialble = await utils.checkAvailability(data.tents);

  if(!TentsAreAvialble){
    throw new BadRequestError("error.noTentsAvailable");
  }

  const tentsDbMap = new Map(tentsDb.map(tent => [tent.id, tent]));

  reserve_tents = reserve_tents.map(tent => {
    if (tent.promotionId) {
      tent.kids = Number(tent.kids ?? 0);
      tent.kidsPrice = Number(tent.kidsPrice ?? 0);
      return tent;
    }
    const foundTent = tentsDbMap.get(tent.idTent);
    if (!foundTent) {
      throw new NotFoundError("error.noAllTentsFound");
    }
    const basePricePerNight = calculatePrice(foundTent.price, foundTent.custom_price);
    tent.name = tent.name ?? foundTent.title;
    tent.price = basePricePerNight;
    tent.nights = Number(tent.nights ?? 0);
    tent.aditionalPeople = Number(tent.aditionalPeople ?? 0);
    tent.aditionalPeoplePrice = foundTent.aditional_people_price;
    tent.kids = Number(tent.kids ?? 0);
    tent.kidsPrice = Number(tent.kidsPrice ?? 0);
    return tent;
  });

  const directTentsWithQuantities = data.tents.map(tent => {
    const foundTent = tentsDbMap.get(tent.idTent);
    if (!foundTent) {
      throw new NotFoundError("error.noAllTentsFound");
    }
    const directTent = reserve_tents.find(rt => !rt.promotionId && rt.idTent === tent.idTent);
    return {
      tent: foundTent,
      nights: Number(tent.nights ?? 0),
      aditionalPeople: directTent ? directTent.aditionalPeople : Number(tent.aditionalPeople ?? 0),
      kids: directTent ? directTent.kids : Number(tent.kids ?? 0),
    };
  });

  const productsWithQuantities = data.products.map(product => {
    const foundProduct = productsDb.find(p => p.id === product.idProduct);
    if (!foundProduct) {
      throw new NotFoundError("error.noAllProductsFound");
    }
    return {
      product: foundProduct,
      quantity: product.quantity
    };
  });

  const experiencesWithQuantities = data.experiences.map(experience => {
    const foundExperience = experiencesDb.find(e => e.id === experience.idExperience);
    if (!foundExperience) {
      throw new NotFoundError("error.noAllExperiencesFound");
    }
    return {
      experience: foundExperience,
      quantity: experience.quantity
    };
  });

  const promotionWithQuantities = data.promotions.map(promotion => ({
    promotionId: promotion.idPromotion,
    price: promotion.price
  }));

  const priceComputation = utils.calculateReservePrice(
    directTentsWithQuantities,
    productsWithQuantities,
    experiencesWithQuantities,
    promotionWithQuantities
  );

  if(data.price_is_calculated){
      reserve.gross_import = priceComputation.total;

      const { netImport, discount, discount_name } = await utils.applyDiscount(reserve.gross_import, reserve.discount_code_id);
      reserve.discount_code_id = reserve.discount_code_id;
      reserve.discount_code_name = discount_name != null ? discount_name : "";
      reserve.discount = discount;
      reserve.net_import = netImport;

  }else{
      const { netImport, discount, discount_name } = await utils.applyDiscount(reserve.gross_import, reserve.discount_code_id, reserve.discount);
      reserve.discount_code_id = reserve.discount_code_id;
      reserve.gross_import = reserve.gross_import;
      reserve.discount_code_name = discount_name != null ? discount_name : "";
      reserve.discount = discount;
      reserve.net_import = netImport;

  }

  const tentBreakdown = priceComputation.tentBreakdown;
  reserve_tents = reserve_tents.map(tent => {
    if (tent.promotionId) {
      return tent;
    }
    const breakdown = tentBreakdown.find(detail => detail.idTent === tent.idTent);
    if (breakdown) {
      tent.aditionalPeople = breakdown.aditionalPeople;
      tent.aditionalPeoplePrice = breakdown.aditionalPeoplePrice;
      tent.kids = breakdown.kids;
      tent.kidsPrice = breakdown.kidsPricePerNight;
      tent.price = breakdown.basePricePerNight;
    }
    return tent;
  });

  await promotionRepository.reducePromotionStock(data.promotions);

  await reserveRepository.upsertReserveDetails(
    reserve.id, 
    reserve_tents, 
    reserve_products, 
    reserve_experiences, 
    reserve_promotions
  );

  return await reserveRepository.updateReserve(id,reserve);
};

export const deleteReserve = async (id: number) => {
  return await reserveRepository.deleteReserve(id);
};

export const AddProductReserveByUser = async(userId: number, data: createReserveProductDto[]) => {

  const reserveId = data[0].reserveId;
  const reserve = await reserveRepository.getReserveById(reserveId);

  if (!reserve) {
    throw new NotFoundError('error.noReservefoundInDB');
  }

  if (reserve.userId !== userId) {
    throw new UnauthorizedError('error.unauthorized');
  }

  const updatedProducts = await Promise.all(data.map(async productData => {
    const product = await productService.getProductById(productData.idProduct);

    if(!product){
      throw new NotFoundError("error.noProductFoundInDB");
    }

    productData.name      = product.name;
    productData.price     = utils.calculatePrice(product.price,product.custom_price);
    productData.confirmed = false;
    return productData;
  }));


  await AddProductReserve(reserve, updatedProducts);  // Pass reserve object to avoid duplicate search
};

export const AddProductReserve = async(reserve: Reserve | null, data: createReserveProductDto[]) => {
  // If reserve is not provided, fetch it from the repository
  let priceIsConfirmed:boolean = false;

  if (!reserve) {
    priceIsConfirmed = true;
    const reserveId = data[0].reserveId;
    reserve = await reserveRepository.getReserveById(reserveId);

    if (!reserve) {
      throw new NotFoundError('error.noReservefoundInDB');
    }
  }

  const processedProducts = await Promise.all(data.map(async productData => {
    const isStock = await productService.checkProductStock(productData.idProduct, productData.quantity);
      if (!isStock) {
        throw new NotFoundError('error.noProductsFoundInStock');
      }
      if(priceIsConfirmed){
        productData.confirmed = true;
      }
      return productData;
    })
  );

  return await reserveRepository.AddProductReserve(processedProducts);
};

export const deleteProductReserve = async (id: number) => {
  return await reserveRepository.deleteProductReserve(id);
};

export const AddExperienceReserveByUser = async(userId: number, data: createReserveExperienceDto[]) => {

  // Assume all data objects belong to the same reserve
  const reserveId = data[0].reserveId;
  const reserve = await reserveRepository.getReserveById(reserveId);

  if (!reserve) {
    throw new NotFoundError('error.noReservefoundInDB');
  }

  if (reserve.userId !== userId) {
    throw new UnauthorizedError('error.unauthorized');
  }

  const updatedExperiences = await Promise.all(data.map(async experienceData => {
    const experience = await experienceService.getExperienceById(experienceData.idExperience);

    if (!experience) {
      throw new NotFoundError("error.noExperienceFoundInDB");
    }

    experienceData.name = experience.name;
    experienceData.price = utils.calculatePrice(experience.price, experience.custom_price);
    experienceData.confirmed = false;
    return experienceData;
  }));

  // Pass the entire array to the AddExperienceReserve function
  await AddExperienceReserve(reserve, updatedExperiences);
};


export const AddExperienceReserve = async(reserve: Reserve | null, data: createReserveExperienceDto[]) => {
  // If reserve is not provided, fetch it from the repository (assuming all belong to the same reserve)
  let priceIsConfirmed:boolean = false;

  if (!reserve) {
    priceIsConfirmed = true;
    const reserveId = data[0].reserveId;
    reserve = await reserveRepository.getReserveById(reserveId);

    if (!reserve) {
      throw new NotFoundError('error.noReservefoundInDB');
    }
  }

  const processedExperiences = data.map(experienceData => {
    if (experienceData.day) {
      const date_parsed = new Date(experienceData.day);
      date_parsed.setUTCHours(17, 0, 0, 0);  // This modifies the date in place
      experienceData.day = date_parsed;
    }

    if(priceIsConfirmed){
      experienceData.confirmed = true;
    }

    return experienceData;
  });

  // Pass the entire array to the repository method
  return await reserveRepository.AddExperienceReserve(processedExperiences);
};

export const deleteExperienceReserve = async (id: number) => {
  return await reserveRepository.deleteExperienceReserve(id);
};

export const downloadReserveBill = async(reserveId:number, user:User|undefined , t: (key: string) => string):Promise<Buffer> => {

  if(!user) throw new UnauthorizedError('error.unauthorized');

  const reserve = await reserveRepository.getReserveDtoById(reserveId);

  if (!reserve) {
    throw new NotFoundError('error.noReservefoundInDB');
  }

  if(user.role === Role.CLIENT && user.id != reserve.userId){
    throw new UnauthorizedError('error.unauthorized')
  }

  if(reserve.reserve_status != ReserveStatus.COMPLETE || reserve.payment_status != PaymentStatus.PAID){
    throw new BadRequestError('error.reserveNotPayOrComplete')
  }

  const buffer = await generateSalesNote(reserve,t);

  if(!buffer) throw new BadRequestError("error.failedToGeneratePDF");

  return buffer;

}


export const confirmEntity = async (entityType: ReserveEntityType, reserveId: number, language:string, entityId?: number ) => {



  switch (entityType) {
    case ReserveEntityType.RESERVE:

      await authService.confirmReservation(reserveId,language);

      return await reserveRepository.confirmReserve(reserveId);

    case ReserveEntityType.TENT:
      if (!entityId) throw new BadRequestError('validation.idRequired');
      // Confirm a specific tent
      return await reserveRepository.confirmTent(entityId);


    case ReserveEntityType.PRODUCT:
      if (!entityId) throw new BadRequestError('validation.idRequired');
      // Confirm a specific product
      return await reserveRepository.confirmProduct(entityId);

    case ReserveEntityType.EXPERIENCE:
      if (!entityId) throw new BadRequestError('validation.idRequired');
      // Confirm a specific experience
      return await reserveRepository.confirmExperience(entityId);

    case ReserveEntityType.PROMOTION:
      if (!entityId) throw new BadRequestError('validation.idRequired');
      // Confirm a specific promotion
      return await reserveRepository.confirmPromotion(entityId);

    default:
      throw new BadRequestError('error.InvalidTypeProvided');
  }
};





