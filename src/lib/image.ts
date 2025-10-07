import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export type ImageVariant = 'normal' | 'small';

export const NORMAL_VARIANT_DIR = '900px';
export const SMALL_VARIANT_DIR = '250px';

interface ProcessImageOptions {
  generateSmall?: boolean;
  removeSource?: boolean;
  outputFileName?: string;
  normalWidth?: number;
  smallWidth?: number;
}

const ensureDirectory = async (directoryPath: string) => {
  await fs.promises.mkdir(directoryPath, { recursive: true });
};

const getOutputFileName = (sourcePath: string, outputFileName?: string): string => {
  const baseName = outputFileName
    ? path.parse(outputFileName).name
    : path.parse(sourcePath).name;

  return `${baseName}.webp`;
};

export const processImage = async (
  sourcePath: string,
  destinationBasePath: string,
  options: ProcessImageOptions = {}
): Promise<{ normalPath: string; smallPath?: string }> => {
  const {
    generateSmall = false,
    removeSource = true,
    outputFileName,
    normalWidth = 900,
    smallWidth = 250,
  } = options;

  const filename = getOutputFileName(sourcePath, outputFileName);

  const normalDir = path.join(destinationBasePath, NORMAL_VARIANT_DIR);
  await ensureDirectory(normalDir);

  const normalFullPath = path.join(normalDir, filename);

  const sourceImage = sharp(sourcePath);

  await sourceImage
    .clone()
    .resize({ width: normalWidth, height: normalWidth, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 100 })
    .toFile(normalFullPath);

  let smallFullPath: string | undefined;

  if (generateSmall) {
    const smallDir = path.join(destinationBasePath, SMALL_VARIANT_DIR);
    await ensureDirectory(smallDir);

    smallFullPath = path.join(smallDir, filename);

    await sourceImage
      .clone()
      .resize({ width: smallWidth, height: smallWidth, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(smallFullPath);
  }

  if (removeSource) {
    try {
      await fs.promises.unlink(sourcePath);
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError?.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  return {
    normalPath: normalFullPath,
    smallPath: smallFullPath,
  };
};

const replaceVariantSegment = (imagePath: string, from: string, to: string): string => {
  const normalized = imagePath.replace(/\\/g, '/');
  const fromSegment = `/${from}/`;
  if (normalized.includes(fromSegment)) {
    return normalized.replace(fromSegment, `/${to}/`);
  }
  return normalized;
};

export const getVariantPath = (imagePath: string, variant: ImageVariant = 'normal'): string => {
  if (!imagePath) {
    return imagePath;
  }

  if (variant === 'small') {
    return replaceVariantSegment(imagePath, NORMAL_VARIANT_DIR, SMALL_VARIANT_DIR);
  }

  return imagePath.replace(/\\/g, '/');
};

interface GetImageUrlOptions {
  size?: ImageVariant;
  basePath?: string;
  publicPrefix?: string;
}

export const getImageUrl = (imagePath: string, options: GetImageUrlOptions = {}): string => {
  if (!imagePath) {
    return imagePath;
  }

  const { size = 'normal', basePath, publicPrefix = 'public' } = options;

  let variantPath = getVariantPath(imagePath, size);

  if (!basePath) {
    return variantPath;
  }

  const normalized = variantPath.replace(/\\/g, '/');
  const prefix = publicPrefix.replace(/\\/g, '/');

  if (normalized.startsWith(`${prefix}/`)) {
    return normalized.replace(prefix, basePath);
  }

  return normalized;
};
