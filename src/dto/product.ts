export interface ProductDto {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  stock:number;
  images: string;
  status?: string;
  custom_price?: string;
  existing_images?:string;
}

export interface PublicProduct extends Omit<ProductDto,'custom_price'|'stock'|'status'>  {
  id:number;
  custom_price?: number;
  category: { id: number; name:string, createdAt:Date, updatedAt:Date };
}

export interface ProductPublicDto extends ProductDto  {
  id:number;
  category: { id: number; name:string, createdAt:Date, updatedAt:Date };
}

export interface ProductFilters {
  name?: string;
  status?:string;
};

export interface PaginatedProducts {
  products: ProductPublicDto[];
  totalPages: number;
  currentPage: number;
};
