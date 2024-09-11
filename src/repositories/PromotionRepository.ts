import { PrismaClient, Promotion } from "@prisma/client";
import { PromotionDto, PromotionFilters, PaginatedPromotions, PromotionPublicDto, PromotionOptions } from "../dto/promotion";
import {BadRequestError, NotFoundError} from "../middleware/errors";
import {ReservePromotionDto} from "../dto/reserve";

const prisma = new PrismaClient();

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllPublicPromotions = async (): Promise<PromotionPublicDto[]> => {
  const promotions = await prisma.promotion.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      tents: true,
      products: true,
      experiences: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let promotionPublicDtos:PromotionPublicDto[] = promotions.map((promotion) => {
    return {
      ...promotion,
      tents: promotion.tents.map(tent => ({
        id:tent.id,
        idTent: tent.idTent,
        name: tent.name,
        price: tent.price,
        nights: tent.nights,
      })),
      products: promotion.products.map(product => ({
        id:product.id,
        idProduct: product.idProduct,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      })),
      experiences: promotion.experiences.map(experience => ({
        id:experience.id,
        idExperience: experience.idExperience,
        name: experience.name,
        price: experience.price,
        quantity: experience.quantity,
      })),
    };
  });

  const PromotionsWithModels = await Promise.all(promotionPublicDtos.map(async (promotion) => {
    const idTents = promotion.tents.map((tent)=> tent.idTent);
    const idProducts = promotion.products.map((product)=>product.idProduct);
    const idExperiences = promotion.experiences.map((experience)=>experience.idExperience);

    const tents = await prisma.tent.findMany({
      where: {
        id: {
          in: idTents,
        },
      },
    });

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: idProducts,
        },
      },
      include: {
        category: true, // Include the category object
      },
    });

    const experiences = await prisma.experience.findMany({
      where: {
        id: {
          in: idExperiences,
        },
      },
      include: {
        category: true, // Include the category object
      },
    });

    return {
      ...promotion,
      tentsDB: tents,
      productsDB:products,
      experiencesDb:experiences,
    } as PromotionPublicDto;
  }));

  return PromotionsWithModels;
};

export const getAllPromotionOptions = async():Promise<PromotionOptions> => {

  const tents =  await prisma.tent.findMany({
    where: {
      status: 'ACTIVE'
    }
  });

  const products =  await prisma.product.findMany({
    where: {
      status: 'ACTIVE'
    },
    include: {
      category: true, // Include the category object
    },
  });

  const experiences =  await prisma.experience.findMany({
    where: {
      status: 'ACTIVE'
    },
    include: {
      category: true, // Include the category object
    },
  });


  return {
    tents,
    products,
    experiences,
  }

}

export const getAllPromotions = async (filters: PromotionFilters, pagination: Pagination): Promise<PaginatedPromotions> => {
  const { title, status } = filters;
  const { page, pageSize } = pagination;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const totalCount = await prisma.promotion.count({
    where: {
      ...(title && { title: { contains: title, mode: 'insensitive' } }),
      ...(status && { status: { contains: status, mode: 'insensitive' } }),
    },
  });

  const promotions = await prisma.promotion.findMany({
    where: {
      ...(title && { title: { contains: title, mode: 'insensitive' } }),
      ...(status && { status: { contains: status, mode: 'insensitive' } }),
    },
    include: {
      tents: true,
      products: true,
      experiences: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
  });

  const promotionDtos = promotions.map((promotion) => {
    return {
      ...promotion,
      tents: promotion.tents.map(tent => ({
        id:tent.id,
        idTent: tent.idTent,
        name: tent.name,
        price: tent.price,
        nights: tent.nights,
      })),
      products: promotion.products.map(product => ({
        id:product.id,
        idProduct: product.idProduct,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
      })),
      experiences: promotion.experiences.map(experience => ({
        id:experience.id,
        idExperience: experience.idExperience,
        name: experience.name,
        price: experience.price,
        quantity: experience.quantity,
      })),
    };
  });

  const PromotionsWithModels = await Promise.all(promotionDtos.map(async (promotion) => {
    const idTents = promotion.tents.map((tent)=> tent.idTent);
    const idProducts = promotion.products.map((product)=>product.idProduct);
    const idExperiences = promotion.experiences.map((experience)=>experience.idExperience);

    const tents = await prisma.tent.findMany({
      where: {
        id: {
          in: idTents,
        },
      },
    });

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: idProducts,
        },
      },
      include: {
        category: true, // Include the category object
      },
    });

    const experiences = await prisma.experience.findMany({
      where: {
        id: {
          in: idExperiences,
        },
      },
      include: {
        category: true, // Include the category object
      },
    });

    return {
      ...promotion,
      tentsDB: tents,
      productsDB:products,
      experiencesDb:experiences,
    } as PromotionPublicDto;
  }));

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    promotions: PromotionsWithModels,
    totalPages,
    currentPage: page,
  };
};

export const getPromotionById = async (id: number): Promise<PromotionPublicDto | null> => {
  return await prisma.promotion.findUnique({
    where: { id },
    include: {
      tents: true,
      products: true,
      experiences: true,
    },
  });
};

export const getPromotionsByIds = async (ids: number[]): Promise<PromotionPublicDto[]> => {
  return await prisma.promotion.findMany({
    where: {
      id: {
        in: ids
      }
    },
    include: {
      tents: true,
      products: true,
      experiences: true,
    },
  });
};

export const createPromotion = async (data: PromotionDto): Promise<Promotion> => {
  const { tents, products, experiences, ...promotionData } = data;

  const createdPromotion = await prisma.promotion.create({
    data: {
      ...promotionData,
      tents: {
        create: tents?.map(tent => ({
          idTent: tent.idTent,
          name: tent.name,
          price: tent.price,
          nights: tent.nights,
        })),
      },
      products: {
        create: products?.map(product => ({
          idProduct: product.idProduct,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
        })),
      },
      experiences: {
        create: experiences?.map(experience => ({
          idExperience: experience.idExperience,
          name: experience.name,
          price: experience.price,
          quantity: experience.quantity,
        })),
      },
    },
  });

  return createdPromotion;
};

export const updatePromotion = async (id: number, data: PromotionDto): Promise<Promotion> => {
  const { tents, products, experiences, ...promotionData } = data;

  const updatedPromotion = await prisma.promotion.update({
    where: { id },
    data: {
      ...promotionData,
      tents: {
        deleteMany: { promotionId: id },
        create: tents?.map(tent => ({
          idTent: tent.idTent,
          name: tent.name,
          price: tent.price,
          nights: tent.nights,
        })),
      },
      products: {
        deleteMany: { promotionId: id },
        create: products?.map(product => ({
          idProduct: product.idProduct,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
        })),
      },
      experiences: {
        deleteMany: { promotionId: id },
        create: experiences?.map(experience => ({
          idExperience: experience.idExperience,
          name: experience.name,
          price: experience.price,
          quantity: experience.quantity,
        })),
      },
    },
  });

  return updatedPromotion;
};

export const updatePromotionStock = async (id: number, newStock: number): Promise<Promotion> => {
  return await prisma.promotion.update({
    where: { id },
    data: {
      stock: newStock,
    },
  });
};

// Function to reduce stock for all promotions in ReservePromotion
export const reducePromotionStock = async (promotions: ReservePromotionDto[]): Promise<void> => {
  // Iterate over all promotions in data.promotions
  for (const promotion of promotions) {
    // Fetch the current promotion stock
    const currentPromotion = await prisma.promotion.findUnique({
      where: { id: promotion.idPromotion },
      select: { stock: true },
    });

    if (!currentPromotion) {
      throw new NotFoundError("error.noPromotionFoundInDB");
    }

    // Calculate the new stock after deducting the promotion's quantity
    const newStock = currentPromotion.stock - promotion.quantity;

    if (newStock < 0) {
      throw new BadRequestError("error.promotionIsOutOfStock");
    }

    // Update the promotion's stock
    await updatePromotionStock(promotion.idPromotion, newStock);
  }
};

export const deletePromotion = async (id: number): Promise<Promotion> => {
  return await prisma.promotion.delete({
    where: { id }
  });
};



export const updatePromotionImages = async (promotionId: number, images: string) => {
  try {
    await prisma.promotion.update({
      where: { id: promotionId },
      data: { images: images }
    });
  } catch (error) {
    throw new BadRequestError("error.noUpdateImages");
  }
};






