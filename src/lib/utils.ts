import fs from 'fs';
import path from 'path';
import { Tent , Product, Experience, Notification } from '@prisma/client';
import { ReserveDto, ReserveExperienceDto, ReserveProductDto, ReservePromotionDto, ReservePromotionFormDto, ReserveTentDto, TentNightlyPreview } from '../dto/reserve';
import { PublicNotification } from '../dto/notification';
import * as reserveRepository from '../repositories/ReserveRepository';
import * as discountCodeRepository from '../repositories/DiscountCodeRepository';
import * as tentRepository from '../repositories/TentRepository';
import * as productRepository from '../repositories/ProductRepository';
import * as experienceRepository from '../repositories/ExperienceRepository';
import * as promotionRepository from '../repositories/PromotionRepository';
import {BadRequestError, NotFoundError} from '../middleware/errors';
import {PromotionPublicDto} from '../dto/promotion';

// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const serializeImagesTodb = (files: { [fieldname: string]: MulterFile[] } | undefined) => {
  let images: string[] = [];
  
  if (files && files.images && Array.isArray(files.images)) {
    images = files.images.map((file: MulterFile) => `public/images/${file.filename}`);
  }
  
  return images.length > 0 ? JSON.stringify(images) : null;
}

export const deleteImages = (imagePaths: string[]) => {
  imagePaths.forEach(imagePath => {
    const fullPath = path.join(__dirname, '../../', imagePath);
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`Failed to delete image: ${imagePath}`, err);
      } else {
        console.log(`Successfully deleted image: ${imagePath}`);
      }
    });
  });
};

export const deleteSubFolder = (tentId: number, subfolderName:string) => {

  const subFolderPath = path.join(__dirname,`../../public/images/${subfolderName}`, tentId.toString());

  if (fs.existsSync(subFolderPath)) {
    fs.rmSync(subFolderPath, { recursive: true, force: true });
    console.log(`Successfully deleted folder: ${subFolderPath}`);
  } else {
    console.error(`Folder does not exist: ${subFolderPath}`);
  }
};


export const moveImagesToSubFolder = async (tentId: number, subfolderName:string ,images: string[]): Promise<string[]> => {
  const newPaths: string[] = [];

  const subFolderPath = path.join(__dirname,`../../public/images/${subfolderName}`, tentId.toString());
  if (!fs.existsSync(subFolderPath)) {
    fs.mkdirSync(subFolderPath, { recursive: true });
  }

  for (const image of images) {
    const oldPath = path.join(__dirname, '../../', image);
    const newPath = path.join(subFolderPath, path.basename(image));
    await fs.promises.rename(oldPath, newPath);
    newPaths.push(newPath.replace(path.join(__dirname, '../../'), ''));
  }

  return newPaths;
};


interface CustomPrice {
  dateFrom: Date;
  dateTo: Date;
  price: number;
}

export interface TentPriceBreakdown {
  idTent: number;
  nights: number;
  basePricePerNight: number;
  nightlyPrice: number;
  aditionalPeople: number;
  aditionalPeoplePrice: number;
  kids: number;
  kidsPricePerNight: number;
  preview: TentNightlyPreview;
}

export interface ReservePriceResult {
  total: number;
  tentBreakdown: TentPriceBreakdown[];
  productsTotal: number;
  experiencesTotal: number;
  promotionsTotal: number;
}

export const calculatePrice = (basePrice: number , customPrices: string | null): number => {

  if(customPrices === null) return basePrice;

  const currentCustomPrice = getCurrentCustomPrice(customPrices);

  return currentCustomPrice > 0 ? currentCustomPrice : basePrice;
};

export const getCurrentCustomPrice = (customPrices: string): number => {

  const prices: CustomPrice[] = JSON.parse(customPrices);

  const currentDate = new Date();
  
  const matchingPrices = prices.filter(price => {
    const dateFrom = new Date(price.dateFrom);
    const dateTo = new Date(price.dateTo);
    return currentDate >= dateFrom && currentDate <= dateTo;
  });

  if (matchingPrices.length === 0) {
    return 0;
  }
  matchingPrices.sort((a, b) => b.dateTo.getTime() - a.dateTo.getTime());

  return matchingPrices[0].price;
}

export const computeTentNightly = (
  tent: Pick<
    Tent,
    |
      'price'
      | 'custom_price'
      | 'qtykids'
      | 'max_kids'
      | 'kids_bundle_price'
      | 'max_aditional_people'
      | 'aditional_people_price'
      | 'qtypeople'
  >,
  selection: { kids?: number; aditionalPeople?: number }
): { preview: TentNightlyPreview; selectedKids: number } => {
  const nightlyBase = calculatePrice(tent.price, tent.custom_price);

  const maxKids = tent.max_kids ?? 0;
  const rawSelectedKids = Number(selection.kids ?? 0);
  if (rawSelectedKids < 0) {
    throw new BadRequestError('error.invalidKidsCount');
  }
  if (rawSelectedKids > maxKids) {
    throw new BadRequestError('error.maxKidsExceeded');
  }

  const selectedKids = Math.max(0, Math.min(rawSelectedKids, maxKids));

  const rawExtraAdults = Number(selection.aditionalPeople ?? 0);
  if (rawExtraAdults < 0) {
    throw new BadRequestError('error.invalidAdditionalPeople');
  }

  const maxExtraAdults = tent.max_aditional_people ?? 0;
  if (rawExtraAdults > maxExtraAdults) {
    throw new BadRequestError('error.maxAdditionalPeopleExceeded');
  }

  const hasKids = selectedKids > 0;
  const effectiveExtraAdults = hasKids ? 0 : rawExtraAdults;

  if (tent.qtypeople + effectiveExtraAdults > 3) {
    throw new BadRequestError('error.maxAdultsExceeded');
  }

  const kidsBundleEligible = tent.kids_bundle_price > 0 && tent.max_kids > 0;
  const kidsBundleApplies = kidsBundleEligible && selectedKids === tent.max_kids && effectiveExtraAdults === 0;
  const kidsBundlePrice = kidsBundleApplies ? tent.kids_bundle_price : 0;

  const nightly = nightlyBase + (effectiveExtraAdults * tent.aditional_people_price) + kidsBundlePrice;

  return {
    preview: {
      nightly,
      nightlyBase,
      kidsBundleApplies,
      kidsBundlePrice,
      effectiveExtraAdults,
    },
    selectedKids,
  };
};

export const checkAvailability = async (tents: ReserveTentDto[]): Promise<boolean> => {
  // Find reservations that overlap with the provided tents' date ranges
  const overlappingReserves = await reserveRepository.getAvailableReserves(tents);

  // Create a Set of overlapping tent IDs for fast lookup
  const overlappingTentIds = new Set(overlappingReserves.map((reservedTent:{reserveId:number,idTent:number}) => reservedTent.idTent));

  // Check if any of the provided tents are in the set of overlapping tents
  const isAvailable = tents.every(tent => !overlappingTentIds.has(tent.idTent));

  return isAvailable;
};

export const getPeopleInReserve = (tents:Tent[] ):{ qtypeople:number, qtykids:number } => {

  const qtypeople = tents.reduce((acc, tent) => acc + (tent.qtypeople ? tent.qtypeople : 0), 0);

  const qtykids = tents.reduce((acc, tent) => acc + (tent.qtykids ? tent.qtykids : 0), 0);

  return {
    qtypeople,
    qtykids,
  }

}

export const checkRoomSize = (tents: Tent[], qtypeople:number, qtyKids:number, aditionalPeople: number|undefined): boolean => {

  const marginPerTent = tents.length;

  const totalCapacityPeople = tents.reduce((acc, tent) => acc + (tent.qtypeople ? tent.qtypeople : 0), 0);

  const totalCapacityKids = tents.reduce((acc, tent) => acc + (tent.qtykids ? tent.qtykids : 0), 0);

  if(totalCapacityKids < qtyKids) return false;

  if(totalCapacityPeople < qtypeople) return false;

  if(!aditionalPeople) return true;
  
  if(marginPerTent < aditionalPeople) return false;

  return true;
};

export const applyDiscount = async (grossImport: number, discountCodeId: number | undefined, discountRaw?: number|undefined): Promise<{netImport: number, discount:number, discount_name:string|null }> => {

  if (!discountCodeId) {
    return {netImport:grossImport, discount:0, discount_name:null};
  }

  const discount = await discountCodeRepository.getDiscountCodeById(discountCodeId);

  if (discount) {

    const newStock = discount.stock - 1;  

    await discountCodeRepository.updateDiscountCodeStock(discountCodeId,newStock);

    return {netImport: (grossImport - (grossImport * discount.discount) / 100 ) , discount: discount.discount,discount_name:discount.code} ;

  }else{

    if(discountRaw && discountRaw >= 0 && discountRaw <= 100){

      return {netImport: (grossImport - (grossImport * discountRaw) / 100), discount:0, discount_name:null};

    }else{

      return {netImport:grossImport, discount:0, discount_name:null};
    }
  }
};


export const getTents = async (tents: ReserveTentDto[]): Promise<Tent[]> => {

  if(!tents) throw new BadRequestError("error.noTentsInArray");

  if(tents.length <= 0) throw new BadRequestError("error.noTentsToValidate");

  const tentsIds = tents.map(tent => tent.idTent);
  let tentsDb = await tentRepository.getTentsByIds(tentsIds);
  tentsDb = tentsDb.filter(tent => tent.status === 'ACTIVE');

  const missingTentIds = tentsIds.filter(
    id => !tentsDb.some((tent:Tent) => tent.id === id)
  );

  if (missingTentIds.length > 0) {
    throw new NotFoundError("error.noAllTentsFound");
  }

  return tentsDb;
}

export const normalizeTimesInTents = (tents:ReserveTentDto[]):ReserveTentDto[] => {

  tents.forEach((tent)=> {

    if(!tent.dateFrom) throw new BadRequestError("error.noDateFromInReserveRequest")
    const checkInTime = new Date(tent.dateFrom);
    checkInTime.setUTCHours(17, 0, 0, 0);
    tent.dateFrom = checkInTime;

    if(!tent.dateTo) throw new BadRequestError("error.noDateToInReserveRequest");
    const checkOutTime = new Date(tent.dateTo);
    checkOutTime.setUTCHours(17, 0, 0, 0);
    tent.dateTo = checkOutTime;
  })

  return tents;
}

export const normalizeTimesInExperience = (experiences:ReserveExperienceDto[]):ReserveExperienceDto[] => {

  experiences.forEach((experience)=>{
    if(!experience.day) throw new BadRequestError("error.noDateFromInReserveRequest")
    const experienceDay = new Date(experience.day);
    experienceDay.setUTCHours(17, 0, 0, 0);
    experience.day = experienceDay;

  })

  return experiences;

}


export const getProducts = async (products: { idProduct: number, name:string, price:number, quantity:number }[]): Promise<Product[]> => {

  if (!products || products.length === 0) {
    return [];
  }

  const productIds = products.map((product) => product.idProduct);
  let productsDb = await productRepository.getProductsByIds(productIds);
  productsDb = productsDb.filter(product => product.status === 'ACTIVE');

  const missingProductIds = productIds.filter(
    (id) => !productsDb.some((product:Product) => product.id === id)
  );

  if (missingProductIds.length > 0) {
    throw new NotFoundError("error.noAllProductsFound");
  }

  return productsDb;
}

export const getExperiences = async (experiences: { idExperience: number, name:string, price:number, quantity:number }[]): Promise<Experience[]> => {

  if (!experiences || experiences.length === 0) {
    return [];
  }

  const experienceIds = experiences.map((experience) => experience.idExperience);
  let   experiencesDb = await experienceRepository.getExperiencesByIds(experienceIds);
  experiencesDb = experiencesDb.filter(experience => experience.status === 'ACTIVE');

  const missingExperienceIds = experienceIds.filter(
    (id) => !experiencesDb.some((experience:Experience) => experience.id === id)
  );

  if (missingExperienceIds.length > 0) {
    throw new NotFoundError("error.noAllExperiencesFound");
  }
  
  return experiencesDb;
}

export const getPromotions = async (promotions: ReservePromotionFormDto[]): Promise<PromotionPublicDto[]> => {

  if (!promotions || promotions.length === 0) {
    return [];
  }

  const promotionIds = promotions.map((promotion) => promotion.idPromotion);
  let   promotionsDb = await promotionRepository.getPromotionsByIds(promotionIds);
  promotionsDb = promotionsDb.filter(promotion => promotion.status === 'ACTIVE');

  const missingPromotionIds = promotionIds.filter(
    (id) => !promotionsDb.some((promotion:PromotionPublicDto) => promotion.id === id)
  );

  if (missingPromotionIds.length > 0) {
    throw new NotFoundError("error.noAllPromotionsFound");
  }
  
  return promotionsDb;
}


export const calculateReservePrice = (
  tents: { tent: Tent; nights: number; aditionalPeople: number; kids?: number }[],
  products: { product: Product; quantity: number }[],
  experiences: { experience: Experience; quantity: number }[],
  promotions: { promotionId: number; price: number }[]
): ReservePriceResult => {

  const tentBreakdown: TentPriceBreakdown[] = tents.map(({ tent, nights, aditionalPeople, kids = 0 }) => {
    const { preview, selectedKids } = computeTentNightly(tent, { kids, aditionalPeople });

    return {
      idTent: tent.id,
      nights,
      basePricePerNight: preview.nightlyBase,
      nightlyPrice: preview.nightly,
      aditionalPeople: preview.effectiveExtraAdults,
      aditionalPeoplePrice: tent.aditional_people_price,
      kids: selectedKids,
      kidsPricePerNight: preview.kidsBundlePrice,
      preview,
    };
  });

  const calculateTentsPrice = tentBreakdown.reduce((acc, breakdown) => {
    return acc + (breakdown.nights * breakdown.nightlyPrice);
  }, 0);

  const calculateProductsPrice = products.reduce((acc, { product, quantity }) => {
    const pricePerProduct = calculatePrice(product.price, product.custom_price);
    return acc + (pricePerProduct * quantity);
  }, 0);

  const calculateExperiencesPrice = experiences.reduce((acc, { experience, quantity }) => {
    const pricePerExperience = calculatePrice(experience.price, experience.custom_price);
    return acc + (pricePerExperience * quantity);
  }, 0);

  const calculatePromotionsPrice = promotions.reduce((acc, { price }) => {
    return acc + price;
  }, 0);

  return {
    total: calculateTentsPrice + calculateProductsPrice + calculateExperiencesPrice + calculatePromotionsPrice,
    tentBreakdown,
    productsTotal: calculateProductsPrice,
    experiencesTotal: calculateExperiencesPrice,
    promotionsTotal: calculatePromotionsPrice,
  };
};


export const parseImagesInReserves = (reserves: ReserveDto[]) => {
  reserves.forEach((reserve) => {
    reserve?.tents?.forEach((tent) => {
      if (tent?.tentDB && typeof tent.tentDB.images === 'string') {
        tent.tentDB.images = JSON.parse(tent.tentDB.images.replace(/\\\\/g, '\\\\') || '[]');
      }

      if (tent?.tentDB) {
        try {
          const { preview, selectedKids } = computeTentNightly(tent.tentDB, {
            kids: tent.kids,
            aditionalPeople: tent.aditionalPeople,
          });
          tent.preview = preview;
          tent.aditionalPeople = preview.effectiveExtraAdults;
          tent.kids = selectedKids;
          tent.kidsPrice = preview.kidsBundlePrice;
          tent.price = preview.nightly;
        } catch (error) {
          // Ignore pricing errors when enriching historic reserves
        }
      }
    });

    reserve?.products?.forEach((product) => {
      if (product?.productDB && typeof product.productDB.images === 'string') {
        product.productDB.images = JSON.parse(product.productDB.images.replace(/\\\\/g, '\\\\') || '[]');
      }
    });

    reserve?.experiences?.forEach((experience) => {
      if (experience?.experienceDB && typeof experience.experienceDB.images === 'string') {
        experience.experienceDB.images = JSON.parse(experience.experienceDB.images.replace(/\\\\/g, '\\\\') || '[]');
      }
    });
  });
};

export const createPublicNotification = (t:any,notification: Notification): PublicNotification => {
  const { title, relatedEntityType ,preview, description, userName, relatedEntityId } = notification;

  let translatedTitle = "";
  let translatedPreview = "";
  let translatedDescription  = "";

  const TypesSupervisor = ["RESERVE","PRODUCT","EXPERIENCE","DISCOUNT_CODE","PROMOTION","TENT"]
  if(relatedEntityType){
    if(TypesSupervisor.includes(relatedEntityType)){

      // Translate and apply placeholders using i18next
      translatedTitle = t(title);
      translatedPreview = t(preview, {
        name: notification.relatedEntityName,
      });
      translatedDescription = t(description, {
        id: relatedEntityId,
        user: userName
      });
    }else{
      translatedTitle = t(title);
      translatedPreview = t(preview, {
        date: notification.relatedEntityName,
      });
      translatedDescription = t(description, {
        date: notification.relatedEntityName,
      });

    }
  }
  // Return the public notification with translations
  return {
    title: translatedTitle,
    preview: translatedPreview,
    description: translatedDescription,
    type: notification.type,
    date: notification.date,
    isRead: notification.isRead
  };
};


export const validatePromotionRequirements = (
  promotionsDB: PromotionPublicDto[], 
  promotions: ReservePromotionDto[], 
  tents: ReserveTentDto[], 
  experiences: ReserveExperienceDto[], 
  products: ReserveProductDto[]
): boolean => {
  // Step 1: Aggregate the quantities of promotions by idPromotion
  const promotionQuantities: Record<number, number> = {}; // Maps idPromotion -> total quantity in the Reserve

  for (const promotion of promotions) {
    promotionQuantities[promotion.idPromotion] = (promotionQuantities[promotion.idPromotion] || 0) + promotion.quantity;
  }

  // Step 2: Aggregate required quantities from promotionsDB
  const totalRequiredTents: Record<number, number> = {};
  const totalRequiredProducts: Record<number, number> = {};
  const totalRequiredExperiences: Record<number, number> = {};

  for (const promotionDB of promotionsDB) {

    if(promotionDB.expiredDate){
      if(promotionDB.expiredDate < new Date()){
        throw new BadRequestError("error.promotionIsExpired");
      }
    }

    if(promotionDB.stock || promotionDB.stock !== null){
      if(promotionDB.stock <= 0) throw new BadRequestError("error.promotionIsOutOfStock");
    }

    const idtents = promotionDB.tents || [];
    const idproducts = promotionDB.products || [];
    const idexperiences = promotionDB.experiences || [];

    const appliedQuantity = promotionQuantities[promotionDB.id] || 0;

    for (const requiredTent of idtents) {
      totalRequiredTents[requiredTent.id] = (totalRequiredTents[requiredTent.id] || 0) + (requiredTent.nights * appliedQuantity);
    }

    for (const requiredProduct of idproducts) {
      totalRequiredProducts[requiredProduct.id] = (totalRequiredProducts[requiredProduct.id] || 0) + (requiredProduct.quantity * appliedQuantity);
    }

    for (const requiredExperience of idexperiences) {
      totalRequiredExperiences[requiredExperience.id] = (totalRequiredExperiences[requiredExperience.id] || 0) + (requiredExperience.quantity * appliedQuantity);
    }
  }

  // Step 3: Validate reservation data against required quantities

  // Validate tents
  for (const [tentId, requiredQty] of Object.entries(totalRequiredTents)) {
    const totalTentNights = tents
      .filter(t => t.idTent === Number(tentId))
      .reduce((sum, tent) => sum + tent.nights, 0);

    if (totalTentNights < requiredQty) {
      return false; // Not enough tents
    }
  }

  // Validate products
  for (const [productId, requiredQty] of Object.entries(totalRequiredProducts)) {
    const totalProductQty = products
      .filter(p => p.idProduct === Number(productId))
      .reduce((sum, product) => sum + product.quantity, 0);

    if (totalProductQty < requiredQty) {
      return false; // Not enough products
    }
  }

  // Validate experiences
  for (const [experienceId, requiredQty] of Object.entries(totalRequiredExperiences)) {
    const totalExperienceQty = experiences
      .filter(e => e.idExperience === Number(experienceId))
      .reduce((sum, experience) => sum + experience.quantity, 0);

    if (totalExperienceQty < requiredQty) {
      return false; // Not enough experiences
    }
  }

  // All validations passed
  return true;
};

export const formatStrToDate = (dateYYYYMMDD:string):Date|undefined => {
  if(!dateYYYYMMDD) return undefined

  const dates = dateYYYYMMDD.split("-");

  const convertedDate =  new Date (Number(dates[0]),Number(dates[1]) - 1,Number(dates[2]),0,0,0,0);
  convertedDate.setUTCHours(17,0,0,0);
  return convertedDate;

}

export const formatDateToYYYYMMDD = (date: Date): string => {
  // Create a new Date object with the current time zone
  const localDate = new Date(date);

  // Get the year, month, and day from the localDate object
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(localDate.getDate()).padStart(2, '0');

  // Return the date in the desired format YYYYY-MM-DD
  return `${year}-${month}-${day}`;
}

export const formatPrice = (price:number) => {
  return price.toLocaleString("es-PE", { style: "currency", currency: "PEN" });
};

export const formatDate = (date:Date) => {
  date.setHours(12);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  //format with time 
  return new Intl.DateTimeFormat("en-US", {dateStyle: "medium", timeStyle: "short"}).format(date);
}

export const generateExternalId = (internalId: number): string => {
  const prefix = 'BAMBU-';

  // Zero-padded number (e.g., 0000001)
  const paddedId = internalId.toString().padStart(7, '0');

  // Combine them to create the external ID
  return `${prefix}${paddedId}`;
};

export const getPromotionItems = async(promotions:ReservePromotionFormDto[]):Promise<{
  tents: ReserveTentDto[],
  products: ReserveProductDto[],
  experiences: ReserveExperienceDto[]
  promotions:ReservePromotionDto[]
}> => {

  let tents:ReserveTentDto[] = [];
  let products:ReserveProductDto[] = [];
  let experiences:ReserveExperienceDto[] = [];
  let promotionsReserve:ReservePromotionDto[] = [];

  const promotionsDB = await getPromotions(promotions);

  for (const promotion of promotions) {
    const promoDB = promotionsDB.find((pr_it) => pr_it.id == promotion.idPromotion);
    if(promoDB){

      const tentsDB = promoDB.tents;

      for(const tentDB of tentsDB){
        let tent:ReserveTentDto = {
          idTent:tentDB.id,
          name:tentDB.name,
          price:tentDB.price,
          nights:promotion.nights,
          dateFrom:promotion.dateFrom,
          dateTo:promotion.dateTo,
          confirmed:false,
          aditionalPeople:0,
          aditionalPeoplePrice:0,
          kids:0,
          kidsPrice:0,
          promotionId:promoDB.id
        }
        tents.push(tent);
      }

      const experiencesDB = promoDB.experiences;

      for(const experienceDB of experiencesDB){
        let experience:ReserveExperienceDto = {
          idExperience:experienceDB.id,
          name:experienceDB.name,
          price:experienceDB.price,
          quantity:experienceDB.quantity,
          day:new Date(),
          confirmed:false,
          promotionId:promoDB.id
        }
        experiences.push(experience);
      }

      const productsDB = promoDB.products;

      for(const productDB of productsDB){
        let product:ReserveProductDto = {
          idProduct:productDB.id,
          name:productDB.name,
          price:productDB.price,
          quantity:productDB.quantity,
          confirmed:false,
          promotionId:promoDB.id
        }
        products.push(product);
      }

      let promotionReserve:ReservePromotionDto = {
        idPromotion:promotion.idPromotion,
        name:promotion.name,
        price:promotion.price,
        quantity:promotion.nights,
        confirmed:false
      }

      promotionsReserve.push(promotionReserve);
    }
  }


  return {
    tents,
    products,
    experiences,
    promotions:promotionsReserve
  }
}

export const getRangeDatesForReserve = (reserve:ReserveDto) => {
    // Initialize an array to store the ranges of dates
    let dateRanges: { date: Date; label: string }[] = [];

    // Loop through each tent in the cart
    reserve.tents.forEach((dateItem) => {
      // Initialize the current date to tent's dateFrom
      let currentDate = new Date(dateItem.dateFrom);

      // Loop through the dates from dateFrom to dateTo for each tent
      while (currentDate <= dateItem.dateTo) {
        const formattedDate = currentDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD

        // Check if the date is already in the dateRanges array to avoid overlap
        const dateExists = dateRanges.some((range) => range.label === formattedDate);

        if (!dateExists) {
          dateRanges.push({
            date: new Date(currentDate),
            label: formattedDate,
          });
        }

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Sort the dateRanges array by date to ensure the dates are in chronological order
    dateRanges = dateRanges.sort((a, b) => a.date.getTime() - b.date.getTime());

    return dateRanges;
};

export  const  generateRandomPassword = () => {
  const length = 10;
  const charset = {
    letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    specials: '!@#$%^&*',
  };

  let password = '';
  
  // Ensure at least one character from each required set
  password += charset.letters.charAt(Math.floor(Math.random() * charset.letters.length));
  password += charset.numbers.charAt(Math.floor(Math.random() * charset.numbers.length));
  password += charset.specials.charAt(Math.floor(Math.random() * charset.specials.length));
  
  // Fill the rest of the password length with random characters from all sets combined
  const allChars = charset.letters + charset.numbers + charset.specials;
  for (let i = password.length; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle password to prevent predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('');
}



