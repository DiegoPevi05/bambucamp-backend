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
  tents?: optTentPromotionDto[];
  products?: optProductPromotionDto[];
  experiences?: optExperiencePromotionDto[];
  existing_images?:string;
}

export interface optTentPromotionDto {
  idTent:number;
  name:string;
  price:number;
  quantity:number;
}

export interface optProductPromotionDto {
  idProduct:number;
  name:string;
  price:number;
  quantity:number;
}

export interface optExperiencePromotionDto {
  idExperience:number;
  name:string;
  price:number;
  quantity:number;
}

export interface PromotionOptions {
  tents?: TentDto[];
  products?: ProductPublicDto[];
  experiences?:ExperiencePublicDto[];
}

export interface PromotionPublicDto extends PromotionDto  {
  id:number;
  tentsDB: TentDto[];
  productsDB?: ProductPublicDto[];
  experiencesDB?:ExperiencePublicDto[];
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


