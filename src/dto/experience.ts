export interface ExperienceDto {
  categoryId: number;
  header: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  images: string;
  limit_age:number;
  qtypeople:number;
  suggestions:string;
  status?: string;
  custom_price?: string;
  existing_images?:string;
}

export interface ExperiencePublicDto extends ExperienceDto  {
  id:number;
  category: { id: number; name:string, createdAt:Date, updatedAt:Date };
}

export interface ExperienceFilters {
  name?: string;
  status?:string;
};

export interface PaginatedExperiences {
  experiences: ExperiencePublicDto[];
  totalPages: number;
  currentPage: number;
};
