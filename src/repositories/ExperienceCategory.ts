import { PrismaClient, Experience   } from "@prisma/client";
import { ExperienceDto } from "../dto/experience";

const prisma = new PrismaClient();

export const getAllExperiences = async (): Promise<Experience[]> => {
  return await prisma.experience.findMany();
};

export const getExperienceById = async (id: number): Promise<Experience | null> => {
  return await prisma.experience.findUnique({
    where: { id }
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


