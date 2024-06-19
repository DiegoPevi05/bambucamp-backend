import * as discountcodeRepository from '../repositories/DiscountCodeRepository';
import { DiscountCodeDto } from '../dto/discountcode';

export const getDiscountCodeByCode = async (code: string) => {
  const discountCode = await discountcodeRepository.getDiscountCodeByCode(code);
  if(!discountCode){
    throw new Error('DiscountCode not found');
  };

  if(discountCode.expiredDate){
    if(discountCode.expiredDate < new Date()){
      throw new Error('DiscountCode expired');
    };
  }

  if(discountCode.stock){
    if(discountCode.stock <= 0){
      throw new Error('DiscountCode out of stock');
    };
  }

  if(discountCode.status === 'INACTIVE'){
    throw new Error('DiscountCode is inactive');
  };
  return discountCode;
};

export const getAllDiscountCodes = async () => {
  return await discountcodeRepository.getAllDiscountCodes();
};

export const getDiscountCodeById = async (id: number) => {
  return await discountcodeRepository.getDiscountCodeById(id);
};

export const createDiscountCode = async (data: DiscountCodeDto) => {

  if(data.expiredDate){
    const expiredDate = new Date(data.expiredDate);

    if(expiredDate < new Date()){
      throw new Error('Expired date must be greater than current date');
    }
  }

  data.discount = Number(data.discount);
  data.stock = Number(data.stock);

  await discountcodeRepository.createDiscountCode(data);
};

export const updateDiscountCode = async (id:number, data: DiscountCodeDto) => {
  const discountCode = await discountcodeRepository.getDiscountCodeById(id);

  if(!discountCode){
    throw new Error('DiscountCode not found');
  }

  if(data.expiredDate){
    const expiredDate = new Date(data.expiredDate);

    if(expiredDate < new Date()){
      throw new Error('Expired date must be greater than current date');
    }
  }

  if(data.discount){
    data.discount = Number(data.discount);
  };

  if(data.stock){
    data.stock = Number(data.stock);
  }

  return await discountcodeRepository.updateDiscountCode(id,data);
};

export const deleteDiscountCode = async (id: number) => {
  return await discountcodeRepository.deleteDiscountCode(id);
};

