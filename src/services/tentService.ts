import * as tentRepository from '../repositories/TentRepository';
import { TentFilters, PaginatedTents, TentDto } from '../dto/tent';


export const getAllPublicTents = async () => {
  const tents = await tentRepository.getAllPublicTents();
  return tents.map((tent) => ({
    header:tent.header,
    title: tent.title,
    description: tent.description,
    services: tent.services,
    images : JSON.parse(tent.images ? tent.images : '[]'),
    qtypeople: tent.qtypeople,
    qtykids: tent.qtykids,
    price: tent.price,
    status: tent.status,
  }));
}

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllTents = async (filters: TentFilters, pagination: Pagination): Promise<PaginatedTents> => {
  const tentsPaginated = await tentRepository.getAllTents(filters,pagination);
  tentsPaginated.tents.forEach((tent) => {
    tent.images = JSON.parse(tent.images ? tent.images : '[]');
  });
  return tentsPaginated;
};

export const getTentById = async (id: number) => {
  return await tentRepository.getTentById(id);
};

export const createTent = async (data: TentDto, images: string |null) => {
  if(images){
    data.images   = images;
  }
  data.qtypeople      = Number(data.qtypeople);
  data.qtykids        = Number(data.qtykids);
  data.price          = Number(data.price);

  await tentRepository.createTent(data);
};

export const updateTent = async (id:number, data: TentDto, images: string |null) => {

  if(data.header){
    data.header = data.header;
  }

  if(data.title){
    data.title   = data.title;
  }

  if(data.description){
    data.description   = data.description;
  }

  if(data.services){
    data.services   = data.services;
  }

  if(images){
    data.images   = images;
  }

  if(data.qtypeople){
    data.qtypeople   = Number(data.qtypeople);
  }

  if(data.qtykids){
    data.qtykids   = Number(data.qtykids);
  }

  if(data.price){
    data.price   = Number(data.price);
  }

  if(data.status){
    data.status   = data.status;
  }


  return await tentRepository.updateTent(id,data);
};

export const deleteTent = async (id: number) => {
  return await tentRepository.deleteTent(id);
};

