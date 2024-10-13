import * as reserveRepository from '../repositories/ReserveRepository';

interface SalesFilters {
  step: "W"|"M"|"Y";
  type:"A"|"P";
}

export const getNetSalesStatistics = async(filters:SalesFilters,language:string) => {
  return await reserveRepository.getNetSalesStatistics(filters,language);
}

export const getReserveQuantityStatistics = async(filters:SalesFilters, language:string) => {
  return await reserveRepository.getReserveQuantityStatistics(filters,language);
}


