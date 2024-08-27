import { PrismaClient, Reserve, ReserveTent, ReserveProduct, ReserveExperience, Tent,   } from "@prisma/client";
import { ReserveDto, ReserveFilters, PaginatedReserve, ReserveTentDto, ReserveExperienceDto, ReserveProductDto, ReserveOptions } from "../dto/reserve";

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
      reserve: {
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
        ],
      },
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

 // Query reserves that either start or end in the month or overlap with the month
  const reserves = await prisma.reserve.findMany({
    where: {
      ...(userId && { userId: userId }),
      AND: [
        {
          dateFrom: { lte: endOfMonth },
        },
        {
          dateTo: { gte: startOfMonth },
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
    },
  });


  return {
    reserves,
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
    },
  });

  const enrichedReserves = await Promise.all(
    reserves.map(async (reserve) => {
      const tentIds = reserve.tents.map((t) => t.idTent);
      const productIds = reserve.products.map((p) => p.idProduct);
      const experienceIds = reserve.experiences.map((e) => e.idExperience);

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

  const totalCount = await prisma.reserve.count({
    where: {
      ...(dateFrom && { dateFrom: { gte: dateFrom } }),
      ...(dateTo && { dateTo: { lte: dateTo } }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const reserves = await prisma.reserve.findMany({
    where: {
      ...(dateFrom && { dateFrom: { gte: dateFrom } }),
      ...(dateTo && { dateTo: { lte: dateTo } }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
    include: {
      tents: true,        // Include ReserveTent data
      products: true,     // Include ReserveProduct data
      experiences: true,  // Include ReserveExperience data
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
          quantity: tent.quantity,
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
    },
  });
};


export const getAvailableReserves = async (checkInTime: Date, checkOutTime: Date, tents: Tent[]): Promise<{ reserveId:number, idTent:number }[]> => {
  // Step 1: Find all ReserveTent entries that have a conflict in the given date range
  return await prisma.reserveTent.findMany({
    where: {
      idTent: {
        in: tents.map(tent => tent.id),
      },
      reserve: {
        AND: [
          {
            dateFrom: {
              lt: checkOutTime, // Reserve ends after check-in
            },
          },
          {
            dateTo: {
              gt: checkInTime, // Reserve starts before check-out
            },
          },
        ],
      },
    },
    select: {
      reserveId: true, // Fetch reserveId instead of idTent
      idTent:true
    },
  });

  /*// Step 2: Extract the reserveIds
  const reserveIds = reservedTents.map(reservedTent => reservedTent.reserveId);

  // Step 3: Fetch all Reserve records that match the reserveIds
  const reserves = await prisma.reserve.findMany({
    where: {
      id: {
        in: reserveIds, // Fetch reserves by reserveIds
      },
    },
    include: {
      tents: true, // Include related ReserveTent records
      products: true, // Optionally include related products
      experiences: true, // Optionally include related experiences
    },
  });

  return reserves;*/
};

export const upsertReserveDetails = async (
  idReserve: number,
  tents: ReserveTentDto[],
  products: ReserveProductDto[],
  experiences: ReserveExperienceDto[]
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

  // Create new tents
  await prisma.reserveTent.createMany({
    data: tents.map((tent) => ({
      idTent: tent.idTent,
      name: tent.name,
      price: tent.price,
      quantity: tent.quantity,
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
