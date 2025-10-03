import * as notificationRepository from "../repositories/NotificationRepository";
import { NotificationDto, PaginatedNotifications, notifcationFilters } from "../dto/notification";
import { Request } from "express";
import { NotificationTarget, NotificationType } from "@prisma/client";

interface Pagination {
  page: number;
  pageSize: number;
}

export const getAllNotificationsUser = async (t: any, filters: notifcationFilters, pagination: Pagination): Promise<PaginatedNotifications> => {
  const filtersUser = {
    ...filters,
    target: [NotificationTarget.USER],
  }
  return await notificationRepository.getAllNotifications(t, filtersUser, pagination);
};


export const getAllNotifications = async (t: any, filters: notifcationFilters, pagination: Pagination): Promise<PaginatedNotifications> => {
  return await notificationRepository.getAllNotifications(t, filters, pagination);
};

export const notificationIsRead = async (notificationId: number) => {
  await notificationRepository.notificationIsRead(notificationId);

}

export const notifyProductCreation = async (req: Request, product: any): Promise<void> => {
  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationProductCreated',
    preview: 'message.NotificationProductCreatedPreview',
    description: 'message.NotificationProductCreatedDescription',
    type: NotificationType.SUCCESS,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: product.id,
    relatedEntityType: 'PRODUCT',
    relatedEntityName: product.name,
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyProductUpdate = async (req: Request, product: any): Promise<void> => {

  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationProductUpdated',
    preview: 'message.NotificationProductUpdatedPreview',
    description: 'message.NotificationProductUpdatedDescription',
    type: NotificationType.INFORMATION,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: product.id,
    relatedEntityType: 'PRODUCT',
    relatedEntityName: product.name,
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyProductDeletion = async (req: Request, productId: number): Promise<void> => {

  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationProductDeleted',
    preview: 'message.NotificationProductDeletedPreview',
    description: 'message.NotificationProductDeletedDescription',
    type: NotificationType.ERROR,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: productId,
    relatedEntityType: 'PRODUCT',
    relatedEntityName: "",
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyExperienceCreation = async (req: Request, experience: any): Promise<void> => {
  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationExperienceCreated',
    preview: 'message.NotificationExperienceCreatedPreview',
    description: 'message.NotificationExperienceCreatedDescription',
    type: NotificationType.SUCCESS,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: experience.id,
    relatedEntityType: 'EXPERIENCE',
    relatedEntityName: experience.name,
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyExperienceUpdate = async (req: Request, experience: any): Promise<void> => {

  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationExperienceUpdated',
    preview: 'message.NotificationExperienceUpdatedPreview',
    description: 'message.NotificationExperienceUpdatedDescription',
    type: NotificationType.INFORMATION,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: experience.id,
    relatedEntityType: 'EXPERIENCE',
    relatedEntityName: experience.name,
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyExperienceDeletion = async (req: Request, experienceId: number): Promise<void> => {

  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationExperienceDeleted',
    preview: 'message.NotificationExperienceDeletedPreview',
    description: 'message.NotificationExperienceDeletedDescription',
    type: NotificationType.ERROR,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: experienceId,
    relatedEntityType: 'EXPERIENCE',
    relatedEntityName: "",
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyDiscountCodeCreation = async (req: Request, discountCode: any): Promise<void> => {
  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationDiscountCodeCreated',
    preview: 'message.NotificationDiscountCodeCreatedPreview',
    description: 'message.NotificationDiscountCodeCreatedDescription',
    type: NotificationType.SUCCESS,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: discountCode.id,
    relatedEntityType: 'DISCOUNT_CODE',
    relatedEntityName: discountCode.name,
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyDiscountCodeUpdate = async (req: Request, discountCode: any): Promise<void> => {

  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationDiscountCodeUpdated',
    preview: 'message.NotificationDiscountCodeUpdatedPreview',
    description: 'message.NotificationDiscountCodeUpdatedDescription',
    type: NotificationType.INFORMATION,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: discountCode.id,
    relatedEntityType: 'DISCOUNT_CODE',
    relatedEntityName: discountCode.name,
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyDiscountCodeDeletion = async (req: Request, discountCodeId: number): Promise<void> => {

  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationDiscountCodeDeleted',
    preview: 'message.NotificationDiscountCodeDeletedPreview',
    description: 'message.NotificationDiscountCodeDeletedDescription',
    type: NotificationType.ERROR,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: discountCodeId,
    relatedEntityType: 'DISCOUNT_CODE',
    relatedEntityName: "",
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyTentCreation = async (req: Request, tent: any): Promise<void> => {
  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationTentCreated',
    preview: 'message.NotificationTentCreatedPreview',
    description: 'message.NotificationTentCreatedDescription',
    type: NotificationType.SUCCESS,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: tent.id,
    relatedEntityType: 'TENT',
    relatedEntityName: tent.name,
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyTentUpdate = async (req: Request, tent: any): Promise<void> => {

  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationTentUpdated',
    preview: 'message.NotificationTentUpdatedPreview',
    description: 'message.NotificationTentUpdatedDescription',
    type: NotificationType.INFORMATION,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: tent.id,
    relatedEntityType: 'TENT',
    relatedEntityName: tent.name,
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyTentDeletion = async (req: Request, tentId: number): Promise<void> => {

  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationTentDeleted',
    preview: 'message.NotificationTentDeletedPreview',
    description: 'message.NotificationTentDeletedDescription',
    type: NotificationType.ERROR,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: tentId,
    relatedEntityType: 'TENT',
    relatedEntityName: "",
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyReserveCreation = async (req: Request, reserve: any): Promise<void> => {
  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationReserveCreated',
    preview: 'message.NotificationReserveCreatedPreview',
    description: 'message.NotificationReserveCreatedDescription',
    type: NotificationType.SUCCESS,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: reserve.id,
    relatedEntityType: 'RESERVE',
    relatedEntityName: reserve.name,
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyReserveUpdate = async (req: Request, reserve: any): Promise<void> => {

  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationReserveUpdated',
    preview: 'message.NotificationReserveUpdatedPreview',
    description: 'message.NotificationReserveUpdatedDescription',
    type: NotificationType.INFORMATION,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: reserve.id,
    relatedEntityType: 'RESERVE',
    relatedEntityName: reserve.name,
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyReserveDeletion = async (req: Request, reserveId: number): Promise<void> => {

  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationReserveDeleted',
    preview: 'message.NotificationReserveDeletedPreview',
    description: 'message.NotificationReserveDeletedDescription',
    type: NotificationType.ERROR,
    target: NotificationTarget.SUPERVISOR,
    userId: req.user.id,
    userName: req.user.firstName,
    relatedEntityId: reserveId,
    relatedEntityType: 'RESERVE',
    relatedEntityName: "",
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}


export const notifyReserveUserCreationUser = async (req: Request, reserveId: number, userId: number, userName: string, reserveDate: Date): Promise<void> => {
  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationReserveUserCreated',
    preview: 'message.NotificationReserveUserCreatedPreview',
    description: 'message.NotificationReserveUserCreatedDescription',
    type: NotificationType.SUCCESS,
    target: NotificationTarget.USER,
    userId: userId,
    userName: userName,
    relatedEntityId: reserveId,
    relatedEntityType: 'RESERVE_USER',
    relatedEntityName: reserveDate.toISOString(),
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

export const notifyReserveUserUpdate = async (req: Request, reserveId: number, userId: number, userName: string, reserveDate: Date): Promise<void> => {

  if (!req.user) return;

  const notificationData: NotificationDto = {
    title: 'message.NotificationReserveUserUpdated',
    preview: 'message.NotificationReserveUserUpdatedPreview',
    description: 'message.NotificationReserveUserUpdatedDescription',
    type: NotificationType.INFORMATION,
    target: NotificationTarget.USER,
    userId: userId,
    userName: userName,
    relatedEntityId: reserveId,
    relatedEntityType: 'RESERVE_USER',
    relatedEntityName: reserveDate.toISOString(),
    date: new Date(),
    isRead: false
  };

  await notificationRepository.createNotification(notificationData);
}

























