export interface TentDto {
  header:string;
  title: string;
  description: string;
  services:string;
  qtypeople: number;
  qtykids: number;
  images?: string;
  price: number;
  status?: string;
  custom_price?: string;
}
