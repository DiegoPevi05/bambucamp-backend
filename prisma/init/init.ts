import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { ReviewsData } from './data/reviews';
import { FaqsData } from './data/faqs';
import bcrypt from 'bcryptjs';
import { TentsData } from './data/tents';
import { ProductsCategoriesData, ProductsData } from './data/products';
import { ExperiencesCategoriesData, ExperiencesData } from './data/experiences';
import { processImage } from '../../src/lib/image';

const getImageFiles = (folderPath: string) => {
  // Define common image file extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  // Read all files in the folder
  const allFiles = fs.readdirSync(folderPath);

  // Filter files that match image extensions
  const imageFiles = allFiles.filter(file => {
    const fileExtension = path.extname(file).toLowerCase();
    return imageExtensions.includes(fileExtension);
  });

  return imageFiles;
};

const moveImagesToSubFolder = async (ObjectId: number, category: string, subfolderName: string): Promise<string[]> => {
  const newPaths: string[] = [];

  // Define the new subfolder path
  const subFolderPath = path.join(__dirname, `../../public/images/${category}/${ObjectId}`);

  // Create the directory if it doesn't exist
  if (!fs.existsSync(subFolderPath)) {
    fs.mkdirSync(subFolderPath, { recursive: true });
  }

  // Get the list of image names from the source folder
  const imageNames = getImageFiles(path.join(__dirname, `./files/${category}/${subfolderName}`));

  const shouldGenerateSmall = category === 'tents';

  for (const image of imageNames) {
    const oldPath = path.join(__dirname, `./files/${category}/${subfolderName}/`, image);
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const { normalPath } = await processImage(oldPath, subFolderPath, {
      generateSmall: shouldGenerateSmall,
      outputFileName: uniqueSuffix,
      removeSource: false,
    });

    newPaths.push(normalPath.replace(path.join(__dirname, '../../'), '').replace(/\\/g, '/'));
  }

  return newPaths;
};

// Helper function to delete all files and subdirectories in a directory
const clearDirectory = (subfolder: string) => {
  const directoryPath = path.join(__dirname, `../../public/images/${subfolder}`);

  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const currentPath = path.join(directoryPath, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        // Recursively delete subdirectory
        fs.rmSync(currentPath, { recursive: true });
      } else {
        // Delete file
        fs.unlinkSync(currentPath);
      }
    });
  }
};

const prisma = new PrismaClient();

async function main() {

  await prisma.reserve.deleteMany();
  //Delete All Users
  await prisma.user.deleteMany();
  //Create Admin User
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "password", 10);

  await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL ?? "admin@bambucamp.com",
      firstName: "Admin",
      lastName: "",
      phoneNumber: "000-000-000",
      password: hashedPassword,
      isDisabled: false,
      emailVerified: true,
      createdAt: new Date(),
      role: 'ADMIN',
    }
  })

  //Delete all Reviews
  await prisma.review.deleteMany();
  //Create Initial Rviews 
  await prisma.review.createMany({
    data: ReviewsData
  });

  //Delete All Faqs
  await prisma.faq.deleteMany();

  await prisma.faq.createMany({
    data: FaqsData
  })

  //before create All tents
  clearDirectory("tents")
  //Delete All Tents
  await prisma.tent.deleteMany();

  // Create a Tent
  await prisma.tent.createMany({
    data: TentsData
  });

  // Get all tents after creation to obtain their IDs
  const allTents = await prisma.tent.findMany({
    where: {
      title: {
        in: TentsData.map(tent => tent.title) // Ensure we are matching the right titles
      }
    }
  });

  // Loop through all created tents and copy images
  for (let tent of allTents) {
    const newPaths = await moveImagesToSubFolder(tent.id, "tents", tent.images);

    // Optionally update the tent with the new image paths if needed
    await prisma.tent.update({
      where: { id: tent.id },
      data: {
        images: JSON.stringify(newPaths) // Update the images field with new paths
      }
    });
  };



  //Delete All Products and productsCategories
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany()

  // Create some Product Categories
  await prisma.productCategory.createMany({
    data: ProductsCategoriesData
  });

  // Get all tents after creation to obtain their IDs
  const productCategories = await prisma.productCategory.findMany({
    where: {
      name: {
        in: ProductsCategoriesData.map(productCategory => productCategory.name) // Ensure we are matching the right titles
      }
    }
  });

  for (let product of ProductsData) {
    const currentCategory = productCategories.find(category => category.name === product.categoryId);

    if (!currentCategory) {
      continue;
    }
    product.categoryId = currentCategory.id;

    await prisma.product.create({
      data: product,
    })
  };


  //before create All tents
  clearDirectory("experiences")
  //Delete All Experiences
  await prisma.experience.deleteMany();
  await prisma.experienceCategory.deleteMany();

  // Create some Product Categories
  await prisma.experienceCategory.createMany({
    data: ExperiencesCategoriesData
  });

  // Get all tents after creation to obtain their IDs
  const experienceCategories = await prisma.experienceCategory.findMany({
    where: {
      name: {
        in: ExperiencesCategoriesData.map(experienceCategory => experienceCategory.name) // Ensure we are matching the right titles
      }
    }
  });

  for (let experience of ExperiencesData) {
    const currentCategory = experienceCategories.find(category => category.name === experience.categoryId);

    if (!currentCategory) {
      continue;
    }
    experience.categoryId = currentCategory.id;

    await prisma.experience.create({
      data: experience,
    })
  };

  // Get all tents after creation to obtain their IDs
  const allExperiences = await prisma.experience.findMany({
    where: {
      name: {
        in: ExperiencesData.map(experience => experience.name) // Ensure we are matching the right titles
      }
    }
  });

  // Loop through all created tents and copy images
  for (let experience of allExperiences) {
    const newPaths = await moveImagesToSubFolder(experience.id, "experiences", experience.images);

    // Optionally update the tent with the new image paths if needed
    await prisma.experience.update({
      where: { id: experience.id },
      data: {
        images: JSON.stringify(newPaths) // Update the images field with new paths
      }
    });
  };

  console.log('Database has been seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
