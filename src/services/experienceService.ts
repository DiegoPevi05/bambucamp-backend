import * as experienceRepository from '../repositories/ExperienceCategory';
import { ExperienceDto } from '../dto/experience';

export const getAllExperiences = async () => {
  return await experienceRepository.getAllExperiences();
};

export const getExperienceById = async (id: number) => {
  return await experienceRepository.getExperienceById(id);
};

export const createExperience = async (data: ExperienceDto) => {
  if(data.imgRoute){
    data.imgRoute = data.imgRoute.split('public/')[1];
  }
  if(data.custom_price){
    data.custom_price = data.custom_price.split('public/')[1];
  }
  await experienceRepository.createExperience(data);
};

export const updateExperience = async (id:number, data: ExperienceDto) => {
  return await experienceRepository.updateExperience(id,data);
};

export const deleteExperience = async (id: number) => {
  return await experienceRepository.deleteExperience(id);
};

