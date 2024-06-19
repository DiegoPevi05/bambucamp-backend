import fs from 'fs';
import path from 'path';
import { Tent } from '@prisma/client';
import * as reserveRepository from '../repositories/ReserveRepository';
import * as discountCodeRepository from '../repositories/DiscountCodeRepository';

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
  
  // Find all prices that match the date range
  const matchingPrices = prices.filter(price => currentDate >= price.dateFrom && currentDate <= price.dateTo);

  // If there are no matching prices, return null
  if (matchingPrices.length === 0) {
    return 0;
  }
  // Sort the matching prices by dateTo in descending order and return the first one
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

