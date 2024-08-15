import * as discountcodeRepository from '../repositories/DiscountCodeRepository';
import { DiscountCodeDto, DiscountCodeFilters, PaginatedDiscountCodes } from '../dto/discountcode';

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

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllDiscountCodes = async (filters:DiscountCodeFilters, pagination:Pagination):Promise<PaginatedDiscountCodes> => {
  return await discountcodeRepository.getAllDiscountCodes(filters,pagination);
};

export const getDiscountCodeById = async (id: number) => {
  return await discountcodeRepository.getDiscountCodeById(id);
};

export const createDiscountCode = async (data: DiscountCodeDto) => {


  if(data.expiredDate){
    const expiredDate = new Date(data.expiredDate);
    expiredDate.setUTCHours(5, 0, 0, 0);

    if(expiredDate < new Date()){
      throw new Error('Expired date must be greater than current date');
    }
    data.expiredDate = expiredDate;
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

  if(data.code &&  data.code != discountCode.code ){
    discountCode.code = data.code;
  }

  if(data.expiredDate){
    const expiredDate = new Date(data.expiredDate);
    expiredDate.setUTCHours(5, 0, 0, 0);

    if(expiredDate < new Date()){
      throw new Error('Expired date must be greater than current date');
    }

    discountCode.expiredDate = expiredDate;
  }

  if(data.discount &&  Number(data.discount) != discountCode.discount ){
    discountCode.discount = Number(data.discount);
  }

  if(data.stock &&  Number(data.stock) != discountCode.stock ){
    discountCode.stock = Number(data.stock);
  }

  if(data.status && data.status != discountCode.status){
    discountCode.status   = data.status;
  }
  
  discountCode.updatedAt = new Date();

  return await discountcodeRepository.updateDiscountCode(id,discountCode);
};

export const deleteDiscountCode = async (id: number) => {
  return await discountcodeRepository.deleteDiscountCode(id);
};

