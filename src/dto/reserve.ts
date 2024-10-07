import {  Experience, PaymentStatus, Tent, Product, Promotion, ReserveStatus } from '@prisma/client';
import { TentDto } from './tent';
import { ProductPublicDto } from './product';
import { ExperiencePublicDto } from './experience';
import { PromotionDto } from './promotion';
import { DiscountCodeDto } from './discountcode'; 

export enum ReserveEntityType {
  RESERVE = 'RESERVE',
  TENT = 'TENT',
  PRODUCT = 'PRODUCT',
  EXPERIENCE = 'EXPERIENCE',
  PROMOTION = 'PROMOTION',
}

export interface ReserveTentDto {
  id?:number;
  idTent:number;
  name:string;
  price:number;
  nights:number;
  dateFrom:Date;
  dateTo:Date;
  confirmed:boolean;
  aditionalPeople:number;
  aditionalPeoplePrice:number;
  promotionId?:number;
  tentDB?:Tent;
}

export interface ReserveProductDto {
  id?:number;
  idProduct:number;
  name:string;
  price:number;
  quantity:number;
  confirmed:boolean;
  promotionId?:number;
  productDB?:Product;
}

export interface createReserveProductDto extends ReserveProductDto{
  reserveId:number;
}

export interface ReserveExperienceDto {
  id?:number;
  idExperience:number;
  name:string;
  price:number;
  quantity:number;
  day:Date;
  confirmed:boolean;
  promotionId?:number;
  experienceDB?:Experience;
}

export interface createReserveExperienceDto extends ReserveExperienceDto{
  reserveId:number;
}

export interface ReservePromotionDto {
  id?:number;
  idPromotion:number;
  name:string;
  price:number;
  quantity:number;
  confirmed:boolean;
  promotionDB?:Promotion;
}
export interface ReservePromotionFormDto {
  idPromotion:number;
  name:string;
  price:number;
  nights:number;
  dateFrom:Date;
  dateTo:Date;
  confirmed:boolean;
}

export interface ReserveOptions {
  tents?: TentDto[];
  products?: ProductPublicDto[];
  experiences?:ExperiencePublicDto[];
  promotions?:PromotionDto[];
  discounts?:DiscountCodeDto[];
}

export interface ReserveDto {
  userId: number;
  user_name?:string;
  user_email?:string;
  external_id:string;
  tents: ReserveTentDto[];
  products: ReserveProductDto[];
  experiences: ReserveExperienceDto[];
  promotions:ReservePromotionDto[];
  dateSale: Date;
  eta?:Date|null;
  price_is_calculated: boolean;
  discount_code_id: number;
  discount_code_name:string;
  net_import: number;
  discount: number;
  gross_import: number;
  canceled_reason: string;
  canceled_status: boolean;
  payment_status: PaymentStatus;
  reserve_status:ReserveStatus;
}

export interface ReserveFormDto {
  userId: number;
  user_email?:string,
  user_firstname?:string;
  user_lastname?:string;
  user_phone_number?:string;
  user_document_type?:string;
  user_document_id?:string;
  user_nationality?:string;
  eta?:Date;
  external_id:string;
  tents: ReserveTentDto[];
  products: ReserveProductDto[];
  experiences: ReserveExperienceDto[];
  promotions:ReservePromotionFormDto[];
  price_is_calculated: boolean;
  discount_code_id: number;
  discount_code_name:string;
  net_import: number;
  discount: number;
  gross_import: number;
  canceled_reason: string;
  canceled_status: boolean;
  payment_status: PaymentStatus;
  reserve_status:ReserveStatus;
}

export interface ReserveFilters {
  dateFrom?:Date;
  dateTo?:Date;
  payment_status?:PaymentStatus;
}

export interface PaginatedReserve {
  reserves:ReserveDto[];
  totalPages:number;
  currentPage:number;
}

