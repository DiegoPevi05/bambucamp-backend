export interface PromotionDto {
  title: string;
  description: string;
  images?: string;
  expireDate: Date;
  status?: string;
  qtypeople: number;
  qtykids: number;
  idtents: string;
  idproducts?: string;
  idexperiences?: string;
  netImport:number;
  discount: number;
  grossImport: number;
  stock: number;
}
