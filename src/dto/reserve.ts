import {  Experience, PaymentStatus, Tent, Product } from '@prisma/client';

export interface ReserveTentDto {
  idTent:number;
  name:string;
  price:number;
  quantity:number;
}

export interface ReserveProductDto {
  idProduct:number;
  name:string;
  price:number;
  quantity:number;
}

export interface ReserveExperienceDto {
  idExperience:number;
  name:string;
  price:number;
  quantity:number;
}

export interface ReserveDto {
  qtypeople: number;
  qtykids: number;
  userId: number;
  tents: ReserveTentDto[];
  tentsDB?:Tent[];
  products: ReserveProductDto[];
  productsDB?:Product[];
  experiences: ReserveExperienceDto[];
  experiencesDB?:Experience[];
  dateFrom: Date;
  dateTo: Date;
  dateSale: Date;
  promotionId: number;
  price_is_calculated: boolean;
  discountCodeId: number;
  netImport: number;
  discount: number;
  grossImport: number;
  canceled_reason: string;
  canceled_status: boolean;
  paymentStatus: PaymentStatus;
  aditionalPeople: number;
}

export interface ReserveFilters {
  dateFrom?:Date;
  dateTo?:Date;
}

export interface PaginatedReserve {
  reserves:ReserveDto[];
  totalPages:number;
  currentPage:number;
}

