import { Request, Response, NextFunction } from 'express';

// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const serializeImagesTodb = (files: { [fieldname: string]: MulterFile[] } | undefined) => {
  let images: string[] = [];
  
  if (files && files.images && Array.isArray(files.images)) {
    images = files.images.map(
      (file: MulterFile) => file.buffer.toString('base64')
    );
  }
  
  return images.length > 0 ? JSON.stringify(images) : null;
}
