export interface ReviewDto {
  name:string;
  title:string;
  review:string;
  stars:number;
  day:Date;
  href:string;
  profile_image_url:string;
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
  tents:any[];
  promotions:any[];
  reviews:PublicReviewDto[];
  faqs:PublicFaqDto[];
}
