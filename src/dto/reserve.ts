import {  Experience, PaymentStatus, Tent, Product } from '@prisma/client';
import { TentDto } from './tent';
import { ProductPublicDto } from './product';
import { ExperiencePublicDto } from './experience';
import { PromotionDto } from './promotion';
import { DiscountCodeDto } from './discountcode'; 

export interface ReserveTentDto {
  idTent:number;
  name:string;
  price:number;
  quantity:number;
  tentDB?:Tent;
}

export interface ReserveProductDto {
  idProduct:number;
  name:string;
  price:number;
  quantity:number;
  productDB?:Product;
}

export interface ReserveExperienceDto {
  idExperience:number;
  name:string;
  price:number;
  quantity:number;
  experienceDB?:Experience;
}

export interface ReserveOptions {
  tents?: TentDto[];
  products?: ProductPublicDto[];
  experiences?:ExperiencePublicDto[];
  promotions?:PromotionDto[];
  discounts?:DiscountCodeDto[];
}

export interface ReserveDto {
  qtypeople: number;
  qtykids: number;
  userId: number;
  tents: ReserveTentDto[];
  products: ReserveProductDto[];
  experiences: ReserveExperienceDto[];
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

