import {  NotificationType,NotificationTarget, User } from '@prisma/client';

export interface NotificationDto {
  title: string;
  preview: string;
  description: string;
  type: NotificationType;
  date: Date;
  isRead: boolean;
  userId?:number;
  userName?:string;
  user?:User;
  target:NotificationTarget;
  relatedEntityId?:number;
  relatedEntityType?:string;
  relatedEntityName?:string;
}

export interface notifcationFilters {
  date?:Date;
  target?:NotificationTarget[]; 
  type?:NotificationType[];
}

export interface PublicNotification extends Omit<NotificationDto,'target'|'relatedEntityId'|'relatedEntityType'|'user'|'userId'|'userName'|'relatedEntityName'>{};

export interface PaginatedNotifications {
  notifications: PublicNotification[];
  totalPages: number;
  currentPage: number;
};
