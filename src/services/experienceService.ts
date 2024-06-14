import * as experienceRepository from '../repositories/ExperienceCategory';
import { ExperienceDto } from '../dto/experience';

export const getAllExperiences = async () => {
  return await experienceRepository.getAllExperiences();
};

export const getExperienceById = async (id: number) => {
  return await experienceRepository.getExperienceById(id);
};

export const createExperience = async (data: ExperienceDto, imgRoutes: string) => {
  data.imgRoute = imgRoutes;
  await experienceRepository.createExperience(data);
};

export const updateExperience = async (id:number, data: ExperienceDto) => {
  return await experienceRepository.updateExperience(id,data);
};

export const deleteExperience = async (id: number) => {
  return await experienceRepository.deleteExperience(id);
};

