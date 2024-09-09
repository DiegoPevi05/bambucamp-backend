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

export interface optTentPromotionPublicDto extends optTentPromotionDto {
  id:number;
}

export interface optProductPromotionDto {
  idProduct:number;
  name:string;
  price:number;
  quantity:number;
}

export interface optProductPromotionPublicDto extends optProductPromotionDto {
  id:number;
}


export interface optExperiencePromotionDto {
  idExperience:number;
  name:string;
  price:number;
  quantity:number;
}

export interface optExperiencePromotionPublicDto extends optExperiencePromotionDto {
  id:number;
}

export interface PromotionPublicDto extends Omit<PromotionDto, 'tents'|'products'|'experiences'>  {
  id:number;
  tents:optTentPromotionPublicDto[];
  products:optProductPromotionPublicDto[];
  experiences:optExperiencePromotionPublicDto[]
  tentsDB?: TentDto[];
  productsDB?: ProductPublicDto[];
  experiencesDB?:ExperiencePublicDto[];
  updatedAt?:Date;
  createdAt?:Date;
}

export interface PromotionOptions {
  tents?: TentDto[];
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


