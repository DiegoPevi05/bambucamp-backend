import { PrismaClient, Experience   } from "@prisma/client";
import { ExperienceDto, ExperienceFilters, ExperiencePublicDto, PaginatedExperiences } from "../dto/experience";
import {BadRequestError} from "../middleware/errors";

const prisma = new PrismaClient();

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllPublicBundles = async () => {
  return prisma.experience.findMany({
    where: {
      status: "ACTIVE",
      category: {
        name: { equals: "BAMBU PAQUETES", mode: "insensitive" },
      },
    },
    include: { category: true },
  });
};

export const getAllPublicExperiences = async (categories?: string[]): Promise<ExperiencePublicDto[]> => {
  return await prisma.experience.findMany({
    where: {
      status: 'ACTIVE',
      ...(categories && { 
        category: {
          name: {
            in: categories, // Filter experiences by the category names array
            mode: 'insensitive', // Optional: make it case-insensitive
          }
        }
      }),
    },
    include: {
      category: true, // Include the category object
    },
  });
};

export const getAllExperiences = async (filters:ExperienceFilters, pagination:Pagination): Promise<PaginatedExperiences> => {
  const { name, status } = filters;
  const { page, pageSize } = pagination;
  
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const totalCount = await prisma.experience.count({
    where: {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(status && { status: { contains: status, mode: 'insensitive' } }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const experiences = await prisma.experience.findMany({
    where: {
      ...(name && { name: { contains: name, mode: 'insensitive' } }),
      ...(status && { status: { contains: status, mode: 'insensitive' } }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
    include: {
      category: true, // Include the category object
    },
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    experiences,
    totalPages,
    currentPage: page,
  };

};

export const getExperienceById = async (id: number): Promise<Experience | null> => {
  return await prisma.experience.findUnique({
    where: { id }
  });
};

export const getExperiencesByIds = async (ids: number[]): Promise<Experience[]> => {
  return await prisma.experience.findMany({
    where: {
      id: {
        in: ids
      }
    }
  });
};

export const createExperience = async (data: ExperienceDto): Promise<Experience> => {
  return await prisma.experience.create({
    data
  });
};

export const updateExperience = async (id:number, data: ExperienceDto): Promise<Experience> => {
  return await prisma.experience.update({
    where: { id },
    data
  });
};

export const deleteExperience = async (id: number): Promise<Experience> => {
  return await prisma.experience.delete({
    where: { id }
  });
};

export const updateExperienceImages = async (experienceId: number, images: string) => {
  try {
    await prisma.experience.update({
      where: { id: experienceId },
      data: { images: images }
    });
  } catch (error) {
    throw new BadRequestError('error.noUpdateImages');
  }
};

