import { PrismaClient, Reserve, ReserveTent, ReserveProduct, ReserveExperience, Tent, ReserveStatus,   } from "@prisma/client";
import { ReserveDto, ReserveFilters, PaginatedReserve, ReserveTentDto, ReserveExperienceDto, ReserveProductDto, ReserveOptions, ReservePromotionDto } from "../dto/reserve";

interface Pagination {
  page: number;
  pageSize: number;
}

export interface ExtendedReserve extends Reserve {
  tents: ReserveTent[];
  products: ReserveProduct[];
  experiences: ReserveExperience[];
}

const prisma = new PrismaClient();

export const searchAvailableTents = async (dateFrom: Date, dateTo: Date): Promise<Tent[]> => {
  // Find all reserved tent IDs within the date range
  const reservedTentIds = await prisma.reserveTent.findMany({
    where: {
      AND: [
        {
          dateFrom: {
            lte: dateTo,
          },
        },
        {
          dateTo: {
            gte: dateFrom,
          },
        },
        {
          reserve: {
            reserve_status: {
              in: [ReserveStatus.CONFIRMED, ReserveStatus.NOT_CONFIRMED],
            },
          },
        },
      ],
    },
    select: {
      idTent: true,
    },
  });

  // Extract unique tent IDs
  const reservedTentIdSet = new Set(reservedTentIds.map(rt => rt.idTent));

  // Fetch all tents that are ACTIVE and not reserved
  const tents = await prisma.tent.findMany({
    where: {
      status: 'ACTIVE',
      id: {
        not: {
          in: Array.from(reservedTentIdSet),
        },
      },
    },
  });

  return tents;
};

export const getMyReservesByMonth = async (page: number, userId?: number): Promise<{ reserves: { id:number, dateFrom:Date, dateTo:Date }[] }> => {
  const currentDate = new Date();

  // Calculate the target month and year based on the page
  const targetDate = new Date(currentDate.setMonth(currentDate.getMonth() + page));
  const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1, 0, 0, 0);
  const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);
  const reserveTents = await prisma.reserveTent.findMany({
    where: {
      reserve: {
        ...(userId && { userId: userId }), // Filter by userId if provided
      },
      AND: [
        {
          dateFrom: { lte: endOfMonth },  // Ensure the reserveTent's dateFrom is within the range
        },
        {
          dateTo: { gte: startOfMonth },  // Ensure the reserveTent's dateTo is within the range
        },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      dateFrom: true,
      dateTo: true,
      reserveId:true
    },
  });

  const formattedReserves = reserveTents.map(reserveTent => ({
    id: reserveTent.reserveId,
    dateFrom: reserveTent.dateFrom,
    dateTo: reserveTent.dateTo,
  }));

  return {
    reserves:formattedReserves,
  };
};

export const getMyReserves = async (pagination: Pagination, userId?: number): Promise<PaginatedReserve> => {
  const { page, pageSize } = pagination;
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Get the total count of reserves for the user
  const totalCount = await prisma.reserve.count({
    where: {
      ...(userId && { userId: userId }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const reserves = await prisma.reserve.findMany({
    where: {
      ...(userId && { userId: userId }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
    include: {
      tents: true,
      products: true,
      experiences: true,
      promotions:true,
    },
  });

  const enrichedReserves = await Promise.all(
    reserves.map(async (reserve) => {
      const tentIds = reserve.tents.map((t) => t.idTent);
      const productIds = reserve.products.map((p) => p.idProduct);
      const experienceIds = reserve.experiences.map((e) => e.idExperience);
      const promotionIds = reserve.promotions.map((e) => e.idPromotion);

      const tentsDB = await prisma.tent.findMany({
        where: {
          id: { in: tentIds },
        },
      });

      const productsDB = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
      });

      const experiencesDB = await prisma.experience.findMany({
        where: {
          id: { in: experienceIds },
        },
      });

      const promotionsDB = await prisma.promotion.findMany({
        where: {

          id: { in: promotionIds },
        },
      });

      return {
        ...reserve,
        tents: reserve.tents.map((tent) => ({
          ...tent,
          tentDB: tentsDB.find((dbTent) => dbTent.id === tent.idTent),
        })),
        products: reserve.products.map((product) => ({
          ...product,
          productDB: productsDB.find((dbProduct) => dbProduct.id === product.idProduct),
        })),
        experiences: reserve.experiences.map((experience) => ({
          ...experience,
          experienceDB: experiencesDB.find((dbExperience) => dbExperience.id === experience.idExperience),
        })),
        promotions: reserve.promotions.map((promotion) => ({
          ...promotion,
          promotionDB: promotionsDB.find((dbPromotion) => dbPromotion.id === promotion.idPromotion),
        })),
      };
    })
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    reserves: enrichedReserves,
    totalPages,
    currentPage: page,
  };
};

export const getAllReserveOptions = async():Promise<ReserveOptions> => {

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

  const promotions = await prisma.promotion.findMany({
    where:{
      status:'ACTIVE'
    },
  })

  const discounts = await prisma.discountCode.findMany({
    where:{
      status:'ACTIVE'
    },
  })

  return {
    tents,
    products,
    experiences,
    promotions,
    discounts
  }

}

export const getAllReserves = async ( filters: ReserveFilters, pagination: Pagination): Promise<PaginatedReserve> => {
  const { dateFrom, dateTo } = filters;
  const { page, pageSize } = pagination;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

 // Find ReserveTent records within the date range
  const reservedTents = await prisma.reserveTent.findMany({
    where: {
      ...(dateFrom && { dateFrom: { lte: dateTo } }), // Ensure dateFrom is within the range
      ...(dateTo && { dateTo: { gte: dateFrom } }),   // Ensure dateTo is within the range
    },
    skip,
    take,
    include: {
      reserve: true,   // Include related Reserve data
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Extract reserve IDs to filter the Reserve records
  const reserveIds = [...new Set(reservedTents.map(tent => tent.reserveId))]; 

  const totalCount = reserveIds.length;

  // Retrieve all Reserve records matching the IDs
  const reserves = await prisma.reserve.findMany({
    where: {
      id: { in: reserveIds },
    },
    include: {
      tents: true,        // Include ReserveTent data
      products: true,     // Include ReserveProduct data
      experiences: true,  // Include ReserveExperience data
      promotions:true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    reserves,
    totalPages,
    currentPage: page,
  };
};

export const getReserveById = async (id: number): Promise<Reserve | null> => {
  return await prisma.reserve.findUnique({
    where: { id }
  });
};


export const createReserve = async (data: ReserveDto): Promise<ReserveDto | null> => {
  // Create the reserve first
  const createdReserve = await prisma.reserve.create({
    data: {
      ...data,
      tents: {
        create: data.tents.map(tent => ({
          idTent: tent.idTent,
          name: tent.name,
          price: tent.price,
          nights: tent.nights,
          dateFrom:tent.dateFrom,
          dateTo:tent.dateTo
        }))
      },
      products: {
        create: data.products.map(product => ({
          idProduct: product.idProduct,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
        }))
      },
      experiences: {
        create: data.experiences.map(experience => ({
          idExperience: experience.idExperience,
          name: experience.name,
          price: experience.price,
          quantity: experience.quantity,
          day:experience.day
        }))
      },
      promotions:{
        create:data.promotions.map(promotion => ({
          idPromotion:promotion.idPromotion,
          name:promotion.name,
          price:promotion.price,
          quantity:promotion.quantity
        }))
      }
    }
  });

  // Query the newly created reserve to include related data
  return await prisma.reserve.findUnique({
    where: { id: createdReserve.id },
    include: {
      tents: true,
      products: true,
      experiences: true,
      promotions:true,
    },
  });
};


export const getAvailableReserves = async (tents: ReserveTentDto[]): Promise<{ reserveId: number; idTent: number }[]> => {
  // Extract tent IDs and filter out any undefined values
  const tentIds = tents.map(tent => tent.idTent).filter((id): id is number => id !== undefined);

  // Prepare the query to find overlapping reservations
  return await prisma.reserveTent.findMany({
    where: {
      idTent: {
        in: tentIds,
      },
      AND: tents.flatMap(tent => [
        {
          dateFrom: {
            lt: tent.dateTo, // Check if the reservation ends after the tent's check-in
          },
        },
        {
          dateTo: {
            gt: tent.dateFrom, // Check if the reservation starts before the tent's check-out
          },
        },
      ]),
    },
    select: {
      reserveId: true,
      idTent: true,
    },
  });
};

export const upsertReserveDetails = async (
  idReserve: number,
  tents: ReserveTentDto[],
  products: ReserveProductDto[],
  experiences: ReserveExperienceDto[],
  promotions:ReservePromotionDto[]
) => {
  // Delete existing tents associated with the reserve
  await prisma.reserveTent.deleteMany({
    where: { reserveId: idReserve },
  });

  // Delete existing products associated with the reserve
  await prisma.reserveProduct.deleteMany({
    where: { reserveId: idReserve },
  });

  // Delete existing experiences associated with the reserve
  await prisma.reserveExperience.deleteMany({
    where: { reserveId: idReserve },
  });

  await prisma.reserveProduct.deleteMany({
    where: { reserveId: idReserve },
  });

  // Create new tents
  await prisma.reserveTent.createMany({
    data: tents.map((tent) => ({
      idTent: tent.idTent,
      dateFrom: tent.dateFrom,
      dateTo:tent.dateTo,
      name: tent.name,
      price: tent.price,
      nights: tent.nights,
      reserveId: idReserve, // Establish the relationship
    })),
  });

  // Create new products
  await prisma.reserveProduct.createMany({
    data: products.map((product) => ({
      idProduct: product.idProduct,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
      reserveId: idReserve, // Establish the relationship
    })),
  });

  // Create new experiences
  await prisma.reserveExperience.createMany({
    data: experiences.map((experience) => ({
      idExperience: experience.idExperience,
      name: experience.name,
      price: experience.price,
      quantity: experience.quantity,
      day:experience.day,
      reserveId: idReserve, // Establish the relationship
    })),
  });

  // Create new experiences
  await prisma.reservePromotion.createMany({
    data: promotions.map((promotion) => ({
      idPromotion: promotion.idPromotion,
      name: promotion.name,
      price: promotion.price,
      quantity: promotion.quantity,
      reserveId: idReserve, // Establish the relationship
    })),
  });

  // Optionally, return the updated reserve with related entities
  return await prisma.reserve.findUnique({
    where: { id: idReserve },
    include: {
      tents: true,
      products: true,
      experiences: true,
      promotions:true,
    },
  });
};

export const updateReserve = async (id:number, data: Reserve): Promise<Reserve> => {
  return await prisma.reserve.update({
    where: { id },
    data
  });
};

export const deleteReserve = async (id: number): Promise<Reserve> => {
  return await prisma.reserve.delete({
    where: { id }
  });
};
