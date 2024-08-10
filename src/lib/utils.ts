import fs from 'fs';
import path from 'path';
import { Tent , Product, Experience } from '@prisma/client';
import * as reserveRepository from '../repositories/ReserveRepository';
import * as discountCodeRepository from '../repositories/DiscountCodeRepository';
import * as tentRepository from '../repositories/TentRepository';
import * as productRepository from '../repositories/ProductRepository';
import * as experienceRepository from '../repositories/ExperienceRepository';

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

export const calculatePrice = (basePrice: number , customPrices: string | null): number => {

  if(customPrices === null) return basePrice;

  const currentCustomPrice = getCurrentCustomPrice(customPrices);

  return currentCustomPrice > 0 ? currentCustomPrice : basePrice;
};

export const getCurrentCustomPrice = (customPrices: string): number => {

  const prices: CustomPrice[] = JSON.parse(customPrices);

  const currentDate = new Date();
  
  const matchingPrices = prices.filter(price => currentDate >= price.dateFrom && currentDate <= price.dateTo);

  if (matchingPrices.length === 0) {
    return 0;
  }
  matchingPrices.sort((a, b) => b.dateTo.getTime() - a.dateTo.getTime());
  
  return matchingPrices[0].price;
}

export const checkAvailability = async (checkInTime: Date, checkOutTime:Date, tents:Tent[]): Promise<boolean> => {
  // Find reservations that overlap with the given date range for the specified tents
  const overlappingReserves = await reserveRepository.getAvailableTents(checkInTime, checkOutTime, tents)

  // Filter out reservations that only overlap on the allowed edge case
  const validOverlaps = overlappingReserves.filter((reserveTent) => {
    const reserve = reserveTent.reserve;
    return !(
      (reserve.dateTo.getTime() === checkInTime.getTime() ||
        reserve.dateFrom.getTime() === checkOutTime.getTime())
    );
  });

  // If there are any overlapping reservations that don't match the allowed edge case, return false
  if (validOverlaps.length > 0) {
    return false;
  }

  // If no overlapping reservations are found, return true
  return true;
};

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

export const applyDiscount = async (grossImport: number, discountCodeId: number | undefined): Promise<number> => {

  if (!discountCodeId) {
    return grossImport;
  }

  const discount = await discountCodeRepository.getDiscountCodeById(discountCodeId);

  if (!discount) {
    return grossImport;
  }

  return grossImport - (grossImport * discount.discount) / 100;
};


export const getTents = async (tents: { idTent:number, name:string, price:number, quantity:number }[]): Promise<Tent[]> => {

  if(!tents) throw new Error( " Input at least one tent" );

  if(tents.length <= 0) throw new Error ("No tents to validate");

  const tentsIds = tents.map(tent => tent.idTent);
  let tentsDb = await tentRepository.getTentsByIds(tentsIds);
  tentsDb = tentsDb.filter(tent => tent.status === 'ACTIVE');

  const missingTentIds = tentsIds.filter(
    id => !tentsDb.some((tent:Tent) => tent.id === id)
  );

  if (missingTentIds.length > 0) {
    throw new Error(`Tents with ids ${missingTentIds.join(', ')} not found`);
  }

  return tentsDb;
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
    throw new Error(`Products with ids ${missingProductIds.join(', ')} not found`);
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
    throw new Error(`Experiences with ids ${missingExperienceIds.join(', ')} not found`);
  }
  
  return experiencesDb;
}

export const calculateReservePrice = (tents: { tent: Tent; quantity: number }[],
  products: { product: Product; quantity: number }[],
  experiences: { experience: Experience; quantity: number }[]): number => {

  // Calculate the total price for tents
  const calculateTentsPrice = tents.reduce((acc, { tent, quantity }) => {
    const pricePerTent = calculatePrice(tent.price, tent.custom_price);
    return acc + (pricePerTent * quantity); // Multiply by quantity
  }, 0);

  // Calculate the total price for products
  const calculateProductsPrice = products.reduce((acc, { product, quantity }) => {
    const pricePerProduct = calculatePrice(product.price, product.custom_price);
    return acc + (pricePerProduct * quantity); // Multiply by quantity
  }, 0);

  // Calculate the total price for experiences
  const calculateExperiencesPrice = experiences.reduce((acc, { experience, quantity }) => {
    const pricePerExperience = calculatePrice(experience.price, experience.custom_price);
    return acc + (pricePerExperience * quantity); // Multiply by quantity
  }, 0);

  return calculateTentsPrice + calculateProductsPrice + calculateExperiencesPrice;
}




