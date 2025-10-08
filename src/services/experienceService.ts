import * as experienceRepository from '../repositories/ExperienceRepository';
import * as utils from '../lib/utils';
import { ExperienceDto, ExperienceFilters, PaginatedExperiences, PublicExperience } from '../dto/experience';
import { deleteSubFolder, serializeImagesTodb, moveImagesToSubFolder, deleteImages } from '../lib/utils';
import {BadRequestError} from '../middleware/errors';

export const getAllPublicBundles = async (): Promise<PublicExperience[]> => {
  const experiences = await experienceRepository.getAllPublicBundles();

  return experiences.map((experience) => ({
    id: experience.id,
    categoryId: experience.categoryId,
    category: experience.category,
    header: experience.header,
    name: experience.name,
    description: experience.description,
    price: experience.price,
    duration: experience.duration,
    images: JSON.parse(experience.images ?? "[]"),
    limit_age: experience.limit_age,
    qtypeople: experience.qtypeople,
    suggestions: experience.suggestions,
    custom_price:
      experience.custom_price != null
        ? utils.calculatePrice(experience.price, experience.custom_price)
        : experience.price,
  }));
};

export const getAllPublicExperiences = async (categories?:string[]) => {
  const experiences = await experienceRepository.getAllPublicExperiences(categories);

  const ExperiencesPublic:PublicExperience[] = [];

  experiences.forEach((experience) => {
    let experiencePublic:PublicExperience = {
      id:experience.id,
      categoryId:experience.categoryId,
      category:experience.category,
      header: experience.header,
      name: experience.name,
      description: experience.description,
      price: experience.price,
      duration: experience.duration,
      images : JSON.parse(experience.images ? experience.images : '[]'),
      limit_age:experience.limit_age,
      qtypeople:experience.qtypeople,
      suggestions:experience.suggestions,
      custom_price: experience.custom_price != undefined ? utils.calculatePrice(experience.price,experience.custom_price) :experience.price 
    }
    ExperiencesPublic.push(experiencePublic);
  });
  return ExperiencesPublic;
};

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllExperiences = async (filters:ExperienceFilters, pagination:Pagination): Promise<PaginatedExperiences> => {
  const experiencesPaginated = await experienceRepository.getAllExperiences(filters,pagination);
  experiencesPaginated.experiences.forEach((experience) => {
    experience.images = JSON.parse(experience.images ? experience.images : '[]');
  });
  return experiencesPaginated;
};

export const getExperienceById = async (id: number) => {
  return await experienceRepository.getExperienceById(id);
};

// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const createExperience = async (data: ExperienceDto, files: MulterFile[] | { [fieldname:string] :MulterFile[]; } | undefined) => {

 const images = serializeImagesTodb(files as { [fieldname: string]: MulterFile[] });

  if(images){
    data.images   = images;
  }
  data.categoryId = Number(data.categoryId);
  data.price      = Number(data.price);
  data.duration   = Number(data.duration);
  data.qtypeople  = Number(data.qtypeople);
  data.limit_age  = Number(data.limit_age);

  const experience = await experienceRepository.createExperience(data);

  if(images){
    // Move images to the new folder
    const movedImages = await moveImagesToSubFolder(experience.id, "experiences", JSON.parse(images || '[]'));

    await updateExperienceImages(experience.id, JSON.stringify(movedImages));
  }

  return experience;

};

export const updateExperience = async (id:number, data: ExperienceDto, files: MulterFile[] | { [fieldname:string] :MulterFile[]; } | undefined) => {

  const experience = await experienceRepository.getExperienceById(id);

  if(!experience){
    throw new BadRequestError('error.noExperienceFoundInDB');
  }

  if(data.categoryId &&  Number(data.categoryId) != experience.categoryId ){
    experience.categoryId = Number(data.categoryId);
  }

  if(data.header &&  data.header != experience.header){
    experience.header   = data.header;
  }

  if(data.name &&  data.name != experience.name){
    experience.name   = data.name;
  }

  if(data.description &&  data.description != experience.description){
    experience.description   = data.description;
  }

  if(data.price &&  Number(data.price) != experience.price ){
    experience.price = Number(data.price);
  }

  if(data.duration &&  Number(data.duration) != experience.duration ){
    experience.duration = Number(data.duration);
  }


  if(files || data.existing_images){

    
    let imagesToConserve:string[] = experience.images ? JSON.parse(experience.images) : [];
    // Normalize paths to use forward slashes
    imagesToConserve = imagesToConserve.map(image => image.replace(/\\/g, '/'));

    if(data.existing_images){

      const imageToReplace: string[] = data.existing_images ? JSON.parse(data.existing_images) : [];

      if (imageToReplace.length >= 0  && imagesToConserve.length != imageToReplace.length ) {
        // Find the images that need to be removed
        const imagesToRemove = imagesToConserve.filter(dbImage => !imageToReplace.includes(dbImage));
        // Perform the removal of images
        if (imagesToRemove.length > 0) {
          deleteImages(imagesToRemove);
        }

        imagesToConserve  = imagesToConserve.filter(dbImage => imageToReplace.includes(dbImage))
      }

    }

    let NewMovedImages:any[] = [];

    if(files){

      const imagesFiles = serializeImagesTodb(files as { [fieldname: string]: MulterFile[] });

      NewMovedImages = await moveImagesToSubFolder(experience.id, "experiences", JSON.parse(imagesFiles || '[]'));

    }

    const allImages = [...imagesToConserve, ...NewMovedImages];

    const formattedImages = allImages.map(image => image.replace(/\//g, '\\'));

    experience.images = JSON.stringify(formattedImages);
  }

  if(data.limit_age &&  Number(data.limit_age) != experience.limit_age ){
    experience.limit_age = Number(data.limit_age);
  }

  if(data.qtypeople &&  Number(data.qtypeople) != experience.qtypeople ){
    experience.qtypeople = Number(data.qtypeople);
  }

  if(data.suggestions && data.suggestions != experience.suggestions){
    experience.suggestions   = data.suggestions;
  }
  
  if(data.status && data.status != experience.status){
    experience.status   = data.status;
  }

  if(data.custom_price && data.custom_price != experience.custom_price){
    experience.custom_price = data.custom_price;
  }

  experience.updatedAt = new Date();

  return await experienceRepository.updateExperience(id,experience);

};

export const deleteExperience = async (id: number) => {

  const experience = await experienceRepository.getExperienceById(id);
  if (experience?.images) {
      deleteSubFolder(experience.id,"experiences");
  }
  return await experienceRepository.deleteExperience(id);
};


export const updateExperienceImages = async (experienceId: number, images: string) => {
  await experienceRepository.updateExperienceImages(experienceId, images);
};
