import { PrismaClient, Reserve, ReserveTent, ReserveProduct, ReserveExperience, Tent,   } from "@prisma/client";
import { ReserveDto, ReserveFilters, PaginatedReserve, ReserveTentDto, ReserveExperienceDto, ReserveProductDto } from "../dto/reserve";

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

export const getMyReserves = async (userId:number): Promise<{reserves:ReserveDto[]}> => {
  const reserves = await prisma.reserve.findMany({
    where: { userId },
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

      const tents = await prisma.tent.findMany({
        where: {
          id: { in: tentIds },
        },
      });

      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
      });

      const experiences = await prisma.experience.findMany({
        where: {
          id: { in: experienceIds },
        },
      });

      return {
        ...reserve,
        tentsDB : tents,
        productsDB: products,
        experiencesDB: experiences,
      };
    })
  );

  return {
    reserves:enrichedReserves,
  }

};

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
  });

  const reserves = await prisma.reserve.findMany({
    where: {
      ...(dateFrom && { dateFrom: { gte: dateFrom } }),
      ...(dateTo && { dateTo: { lte: dateTo } }),
    },
    skip,
    take,
    include: {
      tents: true,        // Include ReserveTent data
      products: true,     // Include ReserveProduct data
      experiences: true,  // Include ReserveExperience data
    },
  });
  // Fetch full Tent, Product, and Experience data based on ids in ReserveTent, ReserveProduct, and ReserveExperience
  const enrichedReserves = await Promise.all(
    reserves.map(async (reserve) => {
      const tentIds = reserve.tents.map((t) => t.idTent);
      const productIds = reserve.products.map((p) => p.idProduct);
      const experienceIds = reserve.experiences.map((e) => e.idExperience);

      const tents = await prisma.tent.findMany({
        where: {
          id: { in: tentIds },
        },
      });

      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
      });

      const experiences = await prisma.experience.findMany({
        where: {
          id: { in: experienceIds },
        },
      });

      return {
        ...reserve,
        tentsDB : tents,
        productsDB: products,
        experiencesDB: experiences,
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

export const getReserveById = async (id: number): Promise<Reserve | null> => {
  return await prisma.reserve.findUnique({
    where: { id }
  });
};


export const createReserve = async (data: ReserveDto): Promise<Reserve> => {
  return await prisma.reserve.create({
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
};


export const getAvailableTents = async (checkInTime: Date, checkOutTime: Date, tents: Tent[]): Promise<any[]> => {
  return await prisma.reserveTent.findMany({
    where: {
      idTent: {
        in: tents.map(tent => tent.id),
      },
      reserve: {
        AND: [
          {
            dateFrom: {
              lt: checkOutTime,
            },
          },
          {
            dateTo: {
              gt: checkInTime,
            },
          },
        ],
      },
    },
    select: {
      idTent: true,
    },
  });
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
