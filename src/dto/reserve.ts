import {  PaymentStatus } from '@prisma/client';

export interface ReserveDto {
  qtypeople: number;
  qtykids: number;
  userId: number;
  tents: { tentId: number; }[];
  products: { productId: number; }[];
  experiences: { experienceId: number; }[];
  discountCodeId?: number;
  dateFrom: Date;
  dateTo: Date;
  dateSale: Date;
  netImport: number;
  discount?: number;
  price_is_calculated: boolean;
  grossImport: number;
  promotionId?: number;
  canceled_reason?: string;
  canceled_status?: boolean;
  paymentStatus?: PaymentStatus;
  aditionalPeople?: number;
}
