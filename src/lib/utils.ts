// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const serializeImagesTodb = (files: MulterFile[] | undefined) =>{
  let imgRoutes: string[] = [];
  if (files && Array.isArray(files)) {
    imgRoutes = (files as MulterFile[]).map(
      (file: MulterFile) => file.buffer.toString('base64')
    );
  }
  return JSON.stringify(imgRoutes);
}
