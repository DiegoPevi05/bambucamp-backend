import { ReserveTent, ReserveProduct, ReserveExperience, PaymentStatus } from '@prisma/client';

export interface ReserveDto {
  qtypeople: number;
  qtykids: number;
  userId: number;
  tents: ReserveTent[];
  products: ReserveProduct[];
  experiences: ReserveExperience[];
  amountTotal: number;
  dateFrom: Date;
  dateTo: Date;
  dateSale: Date;
  promotionId: number;
  payAmountTotal: number;
  canceled_reason?: string;
  canceled_status?: boolean;
  paymentStatus?: PaymentStatus;
  aditionalPeople?: number;
}