import * as experienceRepository from '../repositories/ExperienceRepository';
import { ExperienceDto } from '../dto/experience';
import { deleteImages } from '../lib/utils';

export const getAllPublicExperiences = async () => {
  const experiences = await experienceRepository.getAllPublicExperiences();

  return experiences.map((experience) => ({
    header: experience.header,
    title: experience.title,
    description: experience.description,
    price: experience.price,
    duration: experience.duration,
    images : JSON.parse(experience.images ? experience.images : '[]')
  }));

};
export const getAllExperiences = async () => {
  const experiences = await experienceRepository.getAllExperiences();
  experiences.forEach((experience) => {
    experience.images = JSON.parse(experience.images ? experience.images : '[]');
  });
  return experiences;
};

export const getExperienceById = async (id: number) => {
  return await experienceRepository.getExperienceById(id);
};

export const createExperience = async (data: ExperienceDto, images: string |null) => {
  if(images){
    data.images   = images;
  }
  data.categoryId = Number(data.categoryId);
  data.price      = Number(data.price);

  if(data.custom_price){
    data.custom_price = data.custom_price;
  }

  await experienceRepository.createExperience(data);
};

export const updateExperience = async (id:number, data: ExperienceDto, images: string |null) => {
  const experience = await experienceRepository.getExperienceById(id);

  if(!experience){
    throw new Error('Experience not found');
  }

  if(data.categoryId){
    data.categoryId = Number(data.categoryId);
  }

  if(data.header){
    data.header = data.header;
  }

  if(data.title){
    data.title = data.title;
  }

  if(data.description){
    data.description = data.description;
  }

  if(data.price){
    data.price      = Number(data.price);
  }

  if(data.duration){
    data.duration = data.duration;
  }

  if(images){
    deleteImages(JSON.parse(experience.images ? experience.images : '[]'));
    data.images   = images;
  }
  
  if(data.custom_price){
    data.custom_price = data.custom_price;
  }

  if(data.status){
    if(data.status === 'ACTIVE' || data.status === 'INACTIVE'){
      data.status = data.status;
    }
  }

  return await experienceRepository.updateExperience(id,data);
};

export const deleteExperience = async (id: number) => {

  const experience = await experienceRepository.getExperienceById(id);

  if(!experience){
    throw new Error('Experience not found');
  }

  deleteImages(JSON.parse(experience.images ? experience.images : '[]'));

  return await experienceRepository.deleteExperience(id);
};

