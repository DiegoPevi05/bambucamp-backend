import { Request, Response } from 'express';
import * as tentService from '../services/tentService';
import { body, param, validationResult } from 'express-validator';
import {CustomError} from '../middleware/errors';

export const getAllPublicTents = async (req: Request, res: Response) => {
  try {
    const tents = await tentService.getAllPublicTents();
    res.json(tents);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchTents") });
    }
  }
};

export const getAllTents = async (req: Request, res: Response) => {
  try {
    const { title,status, page = '1', pageSize = '10' } = req.query;

    const filters = {
      title: title as string | undefined,
      status: status as string | undefined
    };

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const PaginatedTents = await tentService.getAllTents(filters, pagination);

    res.json(PaginatedTents);
  } catch (error) {

    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchTents") });
    }

  }
};

export const createTent = [
  body('header').notEmpty().withMessage(req => req.t("validation.headerRequired")),
  body('title').notEmpty().withMessage(req => req.t("validation.titleRequired")),
  body('description').notEmpty().withMessage(req => req.t("validation.descriptionRequired")),
  body('services').notEmpty().withMessage(req => req.t("validation.servicesRequired")),
  body('qtypeople').notEmpty().withMessage(req => req.t("validation.qtypeopleRequired")),
  body('qtykids').notEmpty().withMessage(req => req.t("validation.qtykidsRequired")),
  body('price').notEmpty().withMessage(req => req.t("validation.priceRequired")),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      req.files
      // Create the tent
      await tentService.createTent(req.body, req.files);

      res.status(201).json({ message: req.t("message.tentCreated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToCreateTent") });
      }
    }
  }
];

export const updateTent = [
  param('id').notEmpty().withMessage(req => req.t("validation.idRequired")),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {

      await tentService.updateTent(Number(req.params.id), req.body , req.files);

      res.json({ message: req.t("message.tentUpdated") });

    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToUpdateTent") });
      }
    }
  }
];

export const deleteTent = async (req: Request, res: Response) => {
  try {
    await tentService.deleteTent(Number(req.params.id));

    res.json({ message: req.t("message.tentDeleted") });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToDeleteTent") });
    }
  }
};


