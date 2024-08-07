import { TentDto  } from "./tent";
import { ProductPublicDto } from "./product";
import { ExperiencePublicDto } from "./experience";

export interface PromotionDto {
  title: string;
  description: string;
  images: string;
  expiredDate: Date;
  status: string;
  qtypeople: number;
  qtykids: number;
  netImport:number;
  discount: number;
  grossImport: number;
  stock: number;
  idtents: string;
  idproducts?: string;
  idexperiences?: string;
  existing_images?:string;
}

export interface PromotionPublicDto extends PromotionDto  {
  tents: TentDto[];
  products?: ProductPublicDto[];
  experiences?:ExperiencePublicDto[];
}

export interface PromotionFilters {
  title?: string;
  status?:string;
};

export interface PaginatedPromotions {
  promotions: PromotionPublicDto[];
  totalPages: number;
  currentPage: number;
};


