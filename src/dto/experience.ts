export interface ExperienceDto {
  categoryId: number;
  header: string;
  title: string;
  description: string;
  price: number;
  status: string;
  duration: string;
  imgRoute?: string;
  custom_price?: string;
  createdAt: Date;
}
