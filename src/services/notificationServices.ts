
import * as notificationRepository from "../repositories/NotificationRepository";
import { NotificationDto, PaginatedNotifications, notifcationFilters } from "../dto/notification";
import { Request } from "express";
import { NotificationTarget, NotificationType } from "@prisma/client";

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllNotifications = async (filters: notifcationFilters, pagination: Pagination): Promise<PaginatedNotifications> => {
  const notificationsPaginated = await notificationRepository.getAllNotifications(filters,pagination);
  /*productsPaginated.products.forEach((product) => {
    product.images = JSON.parse(product.images ? product.images : '[]');
  });*/
  return notificationsPaginated;
};

export const notificationIsRead = async(notificationId:number) => {
  await notificationRepository.notificationIsRead(notificationId);

}

export const  notifyProductCreation = async (req: Request, product: any): Promise<void> => {
  if(!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationProductCreated',
    preview: 'message.NotificationProductCreatedPreview',
    description: 'message.NotificationProductCreatedDescription',
    type: NotificationType.SUCCESS,
    target: NotificationTarget.ADMIN,
    userId: req.user.id,
    relatedEntityId: product.id,
    relatedEntityType: 'PRODUCT',
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyProductUpdate = async (req: Request, product: any): Promise<void> => {

  if(!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationProductUpdated',
    preview: 'message.NotificationProductUpdatedPreview',
    description: 'message.NotificationProductUpdatedDescription',
    type: NotificationType.INFORMATION,
    target: NotificationTarget.ADMIN,
    userId: req.user.id,
    relatedEntityId: product.id,
    relatedEntityType: 'PRODUCT',
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const  notifyProductDeletion = async(req: Request, productId: number): Promise<void> =>  {

    if(!req.user) return;

    const notificationData: NotificationDto = {
      title: 'message.NotificationProductDeleted',
      preview: 'message.NotificationProductDeletedPreview',
      description: 'message.NotificationProductDeletedDescription',
      type: NotificationType.ERROR,
      target: NotificationTarget.ADMIN,
      userId: req.user.id,
      relatedEntityId: productId,
      relatedEntityType: 'PRODUCT',
      date: new Date(),
      isRead: false
    };

    await notificationRepository.createNotification(notificationData);
}

