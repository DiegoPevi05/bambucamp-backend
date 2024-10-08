import {PromotionPublicDto} from "./promotion";
import {PublicTent} from "./tent";

export interface ReviewDto {
  name:string;
  title:string;
  review:string;
  stars:number;
  day:Date;
  href:string|null;
  profile_image_url:string|null;
}

export interface PublicReviewDto extends ReviewDto  {
  id:number;
}

export interface PaginatedReviews {
  reviews: PublicReviewDto[];
  totalPages: number;
  currentPage: number;
};

export interface FaqDto {
  question:string;
  answer:string;
}


export interface PublicFaqDto extends FaqDto  {
  id:number;
}

export interface PaginatedFaqs {
  faqs: PublicFaqDto[];
  totalPages: number;
  currentPage: number;
};


export interface webContent {
  tents:PublicTent[];
  promotions:PromotionPublicDto[];
  reviews:PublicReviewDto[];
  faqs:PublicFaqDto[];
}

export interface ContactForm {
  name:string;
  email:string;
  message:string;
  saveinfo:boolean;
}
