export interface DiscountCodeDto {
  code: string;
  discount: number;
  expiredDate?: Date;
  stock?: number;
  status?:string;
}

export interface DiscountCodeFilters {
  code?:string;
  status?:string;
}

export interface PaginatedDiscountCodes {
  discountCodes:DiscountCodeDto[];
  totalPages:number;
  currentPage:number;
}

