import { Request, Response, NextFunction } from 'express';

// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const validateImgFiles = (req: Request, res: Response, next: NextFunction) => {
  const maxFileSize = 2 * 1024 * 1024; // 2MB
  const allowedMimeTypes = ['image/jpeg', 'image/png','image/webp','image/jpg'];
  const files = req.files as MulterFile[] | undefined;

  if (files && Array.isArray(files)) {
    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: `Unsupported file type: ${file.mimetype}` });
      }

      if (file.size > maxFileSize) {
        return res.status(400).json({ error: `File size exceeds limit of 2MB: ${file.originalname}` });
      }
    }
  }
  
  next();
};
