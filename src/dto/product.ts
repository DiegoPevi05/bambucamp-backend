export interface ProductDto {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  quantity:number;
  images: string;
  status?: string;
  custom_price?: string;
  existing_images?:string;
}

export interface ProductFilters {
  name?: string;
};

export interface PaginatedProducts {
  products: ProductDto[];
  totalPages: number;
  currentPage: number;
};
