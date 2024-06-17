import fs from 'fs';
import path from 'path';

// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const serializeImagesTodb = (files: { [fieldname: string]: MulterFile[] } | undefined) => {
  let images: string[] = [];
  
  if (files && files.images && Array.isArray(files.images)) {
    images = files.images.map((file: MulterFile) => `public/images/${file.filename}`);
  }
  
  return images.length > 0 ? JSON.stringify(images) : null;
}

export const deleteImages = (imagePaths: string[]) => {
  imagePaths.forEach(imagePath => {
    const fullPath = path.join(__dirname, '../../', imagePath);
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`Failed to delete image: ${imagePath}`, err);
      } else {
        console.log(`Successfully deleted image: ${imagePath}`);
      }
    });
  });
};
