export interface ProductDto {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  images?: string;
  custom_price?: string;
  status?: string;
}
