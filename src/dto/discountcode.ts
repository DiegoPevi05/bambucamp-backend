export interface DiscountCodeDto {
  code: string;
  expiredDate?: Date;
  discount: number;
  stock?: number;
  status?:string;
}

