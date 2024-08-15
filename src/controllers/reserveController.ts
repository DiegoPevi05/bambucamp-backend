import { Request, Response } from 'express';
import * as reserveService from '../services/reserveService';
import { body, param, validationResult } from 'express-validator';
import {CustomError} from '../middleware/errors';


export const getAllMyReserves = [
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: req.t('error.unauthorized') });
      }
      const reserves = await reserveService.getAllMyReserves(req.user.id);
      res.json(reserves);
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: req.t('error.failedToFetchReserves') });
      }
    }
  }
] 

export const getAllReserveOptions = async( req:Request, res:Response ) => {
  try {
    const reserveOptions = await reserveService.getAllReseveOptions();
    res.json(reserveOptions);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t('error.failedToFetchReserveOptions') });
    }
  }
}


export const getAllReserves = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo, page = '1', pageSize = '10' } = req.query;

    const filters = {
      dateFrom: dateFrom as Date | undefined,
      dateTo: dateTo as Date | undefined
    };

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const PaginatedReserves = await reserveService.getAllReserves(filters, pagination);

    res.json(PaginatedReserves);

  } catch (error) {

    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t('error.failedToFetchReserves') });
    }
  }
};

export const createReserveByUser = [
  body('qtypeople').notEmpty().withMessage(req => req.t('validation.qtypeopleRequired')),
  body('qtykids').notEmpty().withMessage(req => req.t('validation.qtykidsRequired')),
  body('tents').isArray().withMessage(req => req.t('validation.tentsMustBeArray')),
  body('products').isArray().withMessage(req => req.t('validation.productsMustBeArray')),
  body('experiences').isArray().withMessage(req => req.t('validation.experiencesMustBeArray')),
  body('dateFrom').notEmpty().withMessage(req => req.t('validation.dateFromRequired')),
  body('dateTo').notEmpty().withMessage(req => req.t('validation.dateToRequired')),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: req.t('error.unauthorized') });
      };
      await reserveService.createReserveByUser(req.body, req.user.id);
      res.status(201).json({ message: req.t('message.reserveCreated') });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToCreateReserve') });
      }
    }
  }
];

export const createReserve = [
  body('qtypeople').notEmpty().withMessage(req => req.t('validation.qtypeopleRequired')),
  body('qtykids').notEmpty().withMessage(req => req.t('validation.qtykidsRequired')),
  body('userId').notEmpty().withMessage(req => req.t('validation.userIdRequired')),
  body('tents').isArray().withMessage(req => req.t('validation.tentsMustBeArray')),
  body('products').isArray().withMessage(req => req.t('validation.productsMustBeArray')),
  body('experiences').isArray().withMessage(req => req.t('validation.experiencesMustBeArray')),
  body('dateFrom').notEmpty().withMessage(req => req.t('validation.dateFromRequired')),
  body('dateTo').notEmpty().withMessage(req => req.t('validation.dateToRequired')),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      await reserveService.createReserve(req.body);
      res.status(201).json({ message: req.t('message.reserveCreated') });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        console.log(error)
        res.status(500).json({ error: req.t('error.failedToCreateReserve') });
      }
    }
  }
];

export const updateReserve = [
  param('id').notEmpty().withMessage(req => req.t('validation.idRequired')),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      await reserveService.updateReserve(Number(req.params.id), req.body);
      res.json({ message: req.t('message.reserveUpdated') });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToUpdateReserve') });
      }

    }
  }
];

export const deleteReserve = async (req: Request, res: Response) => {
  try {
    await reserveService.deleteReserve(Number(req.params.id));
    res.json({ message: req.t('message.reserveDeleted') });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t('error.failedToDeleteReserve') });
    }
  }
};


