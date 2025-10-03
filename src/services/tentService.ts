import * as tentRepository from '../repositories/TentRepository';
import { TentFilters, PaginatedTents, TentDto, PublicTent } from '../dto/tent';
import { deleteSubFolder, serializeImagesTodb, moveImagesToSubFolder, deleteImages, calculatePrice } from '../lib/utils';
import { NotFoundError } from '../middleware/errors';


export const getAllPublicTents = async () => {
  const tents = await tentRepository.getAllPublicTents();

  const TentsPublic: PublicTent[] = []

  tents.forEach((tent) => {

    let tentPublic: PublicTent = {
      ...tent,
      images: JSON.parse(tent.images ? tent.images : '[]'),
      custom_price: calculatePrice(tent.price, tent.custom_price)
    }
    TentsPublic.push(tentPublic);
  });

  return TentsPublic;
}

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllTents = async (filters: TentFilters, pagination: Pagination): Promise<PaginatedTents> => {
  const tentsPaginated = await tentRepository.getAllTents(filters, pagination);
  tentsPaginated.tents.forEach((tent) => {
    tent.images = JSON.parse(tent.images ? tent.images : '[]');
  });
  return tentsPaginated;
};

export const getTentById = async (id: number) => {
  return await tentRepository.getTentById(id);
};

// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const createTent = async (data: TentDto, files: MulterFile[] | { [fieldname: string]: MulterFile[]; } | undefined) => {

  const images = serializeImagesTodb(files as { [fieldname: string]: MulterFile[] });

  if (images) {
    data.images = images;
  }
  data.qtypeople = Number(data.qtypeople);
  data.qtykids = Number(data.qtykids);
  data.price = Number(data.price);
  data.additional_people_price = Number(data.additional_people_price);
  data.max_additional_people = Number(data.max_additional_people);
  data.max_kids = Number(data.max_kids ?? 0);
  data.kids_bundle_price = Number(data.kids_bundle_price ?? 0);

  const tent = await tentRepository.createTent(data); // Assume this returns the created tent's ID


  if (images) {
    // Move images to the new folder
    const movedImages = await moveImagesToSubFolder(tent.id, "tents", JSON.parse(images || '[]'));

    await updateTentImages(tent.id, JSON.stringify(movedImages));
  }

  return tent;
};

export const updateTent = async (id: number, data: TentDto, files: MulterFile[] | { [fieldname: string]: MulterFile[]; } | undefined) => {

  const tent = await tentRepository.getTentById(id);

  if (!tent) {
    throw new NotFoundError("error.noTentFoundInDB");
  }

  if (data.header && data.header != tent.header) {
    tent.header = data.header;
  }

  if (data.title && data.title != tent.title) {
    tent.title = data.title;
  }

  if (data.description && data.description != tent.description) {
    tent.description = data.description;
  }

  if (data.services && data.services != tent.services) {
    tent.services = data.services;
  }

  if (data.custom_price && data.custom_price != tent.custom_price) {
    tent.custom_price = data.custom_price;
  }

  if (data.additional_people_price && data.additional_people_price != tent.additional_people_price) {
    tent.additional_people_price = data.additional_people_price;
  }

  if (data.max_additional_people && data.max_additional_people != tent.max_additional_people) {
    tent.max_additional_people = data.max_additional_people;
  }

  if (data.max_kids != null && data.max_kids != undefined && data.max_kids != tent.max_kids) {
    tent.max_kids = Number(data.max_kids);
  }

  if (data.kids_bundle_price != null && data.kids_bundle_price != undefined && data.kids_bundle_price != tent.kids_bundle_price) {
    tent.kids_bundle_price = Number(data.kids_bundle_price);
  }


  if (files || data.existing_images) {


    let imagesToConserve: string[] = tent.images ? JSON.parse(tent.images) : [];
    // Normalize paths to use forward slashes
    imagesToConserve = imagesToConserve.map(image => image.replace(/\\/g, '/'));

    if (data.existing_images) {

      const imageToReplace: string[] = data.existing_images ? JSON.parse(data.existing_images) : [];

      if (imageToReplace.length >= 0 && imagesToConserve.length != imageToReplace.length) {
        // Find the images that need to be removed
        const imagesToRemove = imagesToConserve.filter(dbImage => !imageToReplace.includes(dbImage));
        // Perform the removal of images
        if (imagesToRemove.length > 0) {
          deleteImages(imagesToRemove);
        }

        imagesToConserve = imagesToConserve.filter(dbImage => imageToReplace.includes(dbImage))
      }

    }

    let NewMovedImages: any[] = [];

    if (files) {

      const imagesFiles = serializeImagesTodb(files as { [fieldname: string]: MulterFile[] });

      NewMovedImages = await moveImagesToSubFolder(tent.id, "tents", JSON.parse(imagesFiles || '[]'));

    }

    const allImages = [...imagesToConserve, ...NewMovedImages];

    const formattedImages = allImages.map(image => image.replace(/\//g, '\\'));

    tent.images = JSON.stringify(formattedImages);
  }

  if (data.qtypeople && data.qtypeople != tent.qtypeople) {
    tent.qtypeople = Number(data.qtypeople);
  }

  if (data.qtykids && data.qtykids != tent.qtykids) {
    tent.qtykids = Number(data.qtykids);
  }

  if (data.price && Number(data.price) != tent.price) {
    tent.price = Number(data.price);
  }

  if (data.status && data.status != tent.status) {
    tent.status = data.status;
  }

  tent.updatedAt = new Date();

  return await tentRepository.updateTent(id, tent);

};

export const deleteTent = async (id: number) => {

  const tent = await tentRepository.getTentById(id);
  if (tent?.images) {
    deleteSubFolder(tent.id, "tents");
  }
  return await tentRepository.deleteTent(id);
};

export const updateTentImages = async (tentId: number, images: string) => {
  await tentRepository.updateTentImages(tentId, images);
};
