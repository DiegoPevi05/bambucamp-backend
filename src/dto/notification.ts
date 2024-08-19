import {  NotificationType,NotificationTarget, User } from '@prisma/client';

export interface NotificationDto {
  title: string;
  preview: string;
  description: string;
  type: NotificationType;
  date: Date;
  isRead: boolean;
  userId?:number;
  user?:User;
  target:NotificationTarget;
  relatedEntityId?:number;
  relatedEntityType?:string;
}

export interface notifcationFilters {
  date?:Date;
  target?:NotificationTarget[]; 
  type?:NotificationType[];
}

export interface PaginatedNotifications {
  products: NotificationDto[];
  totalPages: number;
  currentPage: number;
};
