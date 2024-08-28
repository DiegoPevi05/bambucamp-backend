export interface TentDto {
  header:string;
  title: string;
  description: string;
  services:string;
  qtypeople: number;
  qtykids: number;
  images: string;
  price: number;
  status: string;
  aditional_people_price:number;
  max_aditional_people:number;
  custom_price?: string;
  existing_images?:string;
}

export interface TentFilters {
  title?: string;
  status?:string;
};

export interface PaginatedTents {
  tents: TentDto[];
  totalPages: number;
  currentPage: number;
};
