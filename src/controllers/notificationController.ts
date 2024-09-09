import { Request, Response } from 'express';
import * as notificationService from '../services/notificationServices';
import { param, validationResult } from 'express-validator';
import {CustomError} from '../middleware/errors';
import {NotificationTarget, NotificationType} from '@prisma/client';

export const getAllNotificationsUser = async (req: Request, res: Response) => {
  try {
    const { date, target, type , page = '1', pageSize = '10' } = req.query;

    const filters = {
      date: date as Date | undefined,
      target: target as NotificationTarget[] | undefined,
      type: type as NotificationType[] | undefined
    };

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const PaginatedNotifications = await notificationService.getAllNotificationsUser(req.t, filters, pagination);

    res.json(PaginatedNotifications);

  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchNotifications") });
    }
  }
};


export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const { date, target, type , page = '1', pageSize = '10' } = req.query;

    const filters = {
      date: date as Date | undefined,
      target: target as NotificationTarget[] | undefined,
      type: type as NotificationType[] | undefined
    };

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const PaginatedNotifications = await notificationService.getAllNotifications(req.t, filters, pagination);

    res.json(PaginatedNotifications);

  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchNotifications") });
    }
  }
};


export const updateisRead = [
  param('id').notEmpty().withMessage("validation.idRequired"),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {

      await notificationService.notificationIsRead(Number(req.params.id));

      res.json({ message: req.t("message.notificationIsRead") });

    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToUpdateNotification") });
      }
    }
  }
];

