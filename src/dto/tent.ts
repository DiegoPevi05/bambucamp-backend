export interface TentDto {
  header: string;
  title: string;
  description: string;
  services: string;
  qtypeople: number;
  qtykids: number;
  images: string;
  price: number;
  status: string;
  additional_people_price: number;
  max_additional_people: number;
  max_kids: number;
  kids_bundle_price: number;
  custom_price?: string;
  existing_images?: string;
}

export interface PublicTent extends Omit<TentDto, 'custom_price'> {
  id: number;
  custom_price?: number;
}

export interface TentFilters {
  title?: string;
  status?: string;
};

export interface PaginatedTents {
  tents: TentDto[];
  totalPages: number;
  currentPage: number;
};
