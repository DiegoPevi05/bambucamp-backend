import { PrismaClient, Notification   } from "@prisma/client";
import { NotificationDto, PaginatedNotifications } from "../dto/notification";
import {BadRequestError} from "../middleware/errors";
import {notifcationFilters} from "../dto/notification";
import { createPublicNotification } from "../lib/utils";

const prisma = new PrismaClient();

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllNotifications = async (t:any, filters: notifcationFilters, pagination: Pagination): Promise<PaginatedNotifications> => {
  const { date, target, type } = filters; // Adjusted to match the filters in notifcationFilters
  const { page, pageSize } = pagination;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Apply the filters to the Notification model
  const totalCount = await prisma.notification.count({
    where: {
      ...(date && { date: { equals: date } }),
      ...(target && target.length > 0 && { target: { in: target } }), 
      ...(type && type.length > 0 && { type: { in: type } }), 
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  const notifications = await prisma.notification.findMany({
    where: {
      ...(date && { date: { equals: date } }), 
      ...(target && target.length > 0 && { target: { in: target } }), 
      ...(type && type.length > 0 && { type: { in: type } }), 
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take,
    include: {
      user: true, // Include the user object if needed
    },
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const publicNotifications = notifications.map((notification) => {
    return createPublicNotification(t,notification);
  });

  // Returning notifications with pagination details
  return {
    notifications: publicNotifications, // Map results to NotificationDto if needed
    totalPages,
    currentPage: page,
  };
};

export const getNotificationById = async (id: number): Promise<Notification | null> => {
  return await prisma.notification.findUnique({
    where: { id }
  });
};

export const getNotificationsByIds = async (ids: number[]): Promise<Notification[]> => {
  return await prisma.notification.findMany({
    where: {
      id: {
        in: ids
      }
    }
  });
};

export const createNotification = async (data: NotificationDto): Promise<Notification> => {
  const { user, userId, ...rest } = data;
  return await prisma.notification.create({
    data: {
      ...rest,
      ...(userId && {
        user: {
          connect: { id: userId }
        }
      }),
    }
  });
};

export const updateNotification = async (id:number, data: Notification): Promise<Notification> => {
  return await prisma.notification.update({
    where: { id },
    data
  });
};

export const deleteNotification = async (id: number): Promise<Notification> => {
  return await prisma.notification.delete({
    where: { id }
  });
};

export const notificationIsRead = async ( id:number ): Promise<Notification> => {
  return await prisma.notification.update({
    where:{ id },
    data:{
      isRead:true,
    }
  })
}

export const updateProductImages = async (productId: number, images: string) => {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { images: images }
    });
  } catch (error) {
    throw new BadRequestError("error.noUpdateImages");
  }
};




