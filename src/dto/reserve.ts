import { Experience, PaymentStatus, Tent, Product, ReserveStatus } from '@prisma/client';
import { TentDto } from './tent';
import { ProductPublicDto } from './product';
import { ExperiencePublicDto } from './experience';
import { DiscountCodeDto } from './discountcode';

export enum ReserveEntityType {
  RESERVE = 'RESERVE',
  TENT = 'TENT',
  PRODUCT = 'PRODUCT',
  EXPERIENCE = 'EXPERIENCE'
}

export interface ReserveTentDto {
  id?: number;
  idTent: number;
  name: string;
  price: number;
  nights: number;
  dateFrom: Date;
  dateTo: Date;
  confirmed: boolean;
  additional_people: number;
  additional_people_price: number;
  kids: number;
  kids_price: number;
  tentDB?: Tent;
}

export interface ReserveProductDto {
  id?: number;
  idProduct: number;
  name: string;
  price: number;
  quantity: number;
  confirmed: boolean;
  productDB?: Product;
}

export interface createReserveProductDto extends ReserveProductDto {
  reserveId: number;
}

export interface ReserveExperienceDto {
  id?: number;
  idExperience: number;
  name: string;
  price: number;
  quantity: number;
  day: Date;
  confirmed: boolean;
  experienceDB?: Experience;
}

export interface createReserveExperienceDto extends ReserveExperienceDto {
  reserveId: number;
}

export interface ReserveOptions {
  tents?: TentDto[];
  products?: ProductPublicDto[];
  experiences?: ExperiencePublicDto[];
  discounts?: DiscountCodeDto[];
}

export interface ReserveDto {
  id?: number;
  userId: number;
  user_name?: string;
  user_email?: string;
  external_id: string;
  tents: ReserveTentDto[];
  products: ReserveProductDto[];
  experiences: ReserveExperienceDto[];
  dateSale: Date;
  eta?: Date | null;
  price_is_calculated: boolean;
  discount_code_id: number;
  discount_code_name: string;
  net_import: number;
  discount: number;
  gross_import: number;
  canceled_reason: string;
  canceled_status: boolean;
  payment_status: PaymentStatus;
  reserve_status: ReserveStatus;
}

export interface ReserveFormDto {
  userId: number;
  user_email?: string,
  user_firstname?: string;
  user_lastname?: string;
  user_phone_number?: string;
  user_document_type?: string;
  user_document_id?: string;
  eta?: Date;
  external_id: string;
  tents: ReserveTentDto[];
  products: ReserveProductDto[];
  experiences: ReserveExperienceDto[];
  price_is_calculated: boolean;
  discount_code_id: number;
  discount_code_name: string;
  net_import: number;
  discount: number;
  gross_import: number;
  canceled_reason: string;
  canceled_status: boolean;
  payment_status: PaymentStatus;
  reserve_status: ReserveStatus;
}

export interface ReserveFilters {
  dateFrom?: Date;
  dateTo?: Date;
  payment_status?: PaymentStatus;
}

export interface PaginatedReserve {
  reserves: ReserveDto[];
  totalPages: number;
  currentPage: number;
}

