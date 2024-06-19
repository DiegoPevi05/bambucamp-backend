import { PrismaClient, Reserve, ReserveTent, ReserveProduct, ReserveExperience, Tent  } from "@prisma/client";
import { ReserveDto } from "../dto/reserve";


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
        OR: [
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
      tentId: true,
    },
  });

  // Extract unique tent IDs
  const reservedTentIdSet = new Set(reservedTentIds.map(rt => rt.tentId));

  // Fetch all tents that are ACTIVE and add the 'reserved' field
  const tents = await prisma.tent.findMany({
    where: {
      status: 'ACTIVE',
    },
  });

  return tents.map(tent => ({
    ...tent,
    reserved: reservedTentIdSet.has(tent.id),
  }));
};

export const getMyReserves = async (userId:number): Promise<ExtendedReserve[]> => {
  return await prisma.reserve.findMany({
    where: { userId },
    include: {
      tents: true,
      products: true,
      experiences: true,
    },
  });
};

export const getAllReserves = async (): Promise<Reserve[]> => {
  return await prisma.reserve.findMany({
    include: {
      tents: {
        include: {
          tent: true
        }
      },
      products: {
        include: {
          product: true
        }
      },
      experiences: {
        include: {
          experience: true
        }
      }
    }
  });
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
          tentId: tent.tentId
        }))
      },
      products: {
        create: data.products.map(product => ({
          productId: product.productId
        }))
      },
      experiences: {
        create: data.experiences.map(experience => ({
          experienceId: experience.experienceId
        }))
      }
    }
  });
};


export const getAvailableTents = async (checkInTime: Date, checkOutTime:Date, tents:Tent[]): Promise<any[]> => {
  // Find reservations that overlap with the given date range
  return await prisma.reserveTent.findMany({
    where: {
      tentId: {
        in: tents.map(tent => tent.id),
      },
      reserve: {
        OR: [
          {
            dateFrom: {
              lt: checkOutTime,
            },
            dateTo: {
              gt: checkInTime,
            },
          },
        ],
      },
    },
    select: {
      tentId: true,
    }
  });
}

export const updateReserve = async (id:number, data: ReserveDto): Promise<Reserve> => {
  return await prisma.reserve.update({
    where: { id },
    data: {
      ...data,
      tents: {
        create: data.tents.map(tent => ({
          tentId: tent.tentId
        }))
      },
      products: {
        create: data.products.map(product => ({
          productId: product.productId
        }))
      },
      experiences: {
        create: data.experiences.map(experience => ({
          experienceId: experience.experienceId
        }))
      }
    }
  });
};

export const deleteReserve = async (id: number): Promise<Reserve> => {

  await prisma.reserveTent.deleteMany({
    where: { reserveId: id }
  });
  await prisma.reserveProduct.deleteMany({
    where: { reserveId: id }
  });
  await prisma.reserveExperience.deleteMany({
    where: { reserveId: id }
  });

  return await prisma.reserve.delete({
    where: { id }
  });
};


