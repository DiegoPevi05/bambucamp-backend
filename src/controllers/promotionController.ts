import { Request, Response } from 'express';
import * as promotionService from '../services/promotionService';
import { body, param, validationResult } from 'express-validator';
import {CustomError} from '../middleware/errors';

export const getAllPublicPromotions = async (req: Request, res: Response) => {
  try {
    const promotions = await promotionService.getAllPublicPromotions();
    res.json(promotions);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchPromotions") });
    }
  }
};

export const getAllPromotionOptions = async( req:Request, res:Response ) => {
  try {
    const promotionsOptions = await promotionService.getAllPromotionOptions();
    res.json(promotionsOptions);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchPromotionOptions") });
    }
  }
}

export const getAllPromotions = async (req: Request, res: Response) => {
  try {
    const { title, status, page = '1', pageSize = '10' } = req.query;

    const filters = {
      title: title as string | undefined,
      status: status as string | undefined
    };

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const PaginatedPromotions = await promotionService.getAllPromotions(filters, pagination);

    res.json(PaginatedPromotions);

  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
     res.status(500).json({ error: req.t("error.failedToFetchPromotions") });
    }
  }
};

export const createPromotion = [
  body('title').notEmpty().withMessage(req => req.t("titleRequired")),
  body('description').notEmpty().withMessage(req => req.t("descriptionRequired")),
  body('expiredDate').notEmpty().withMessage(req => req.t("expiredDateRequired")),
  body('status').notEmpty().withMessage(req => req.t("statusRequired")),
  body('qtypeople').notEmpty().withMessage(req => req.t("qtypeopleRequired")),
  body('qtykids').notEmpty().withMessage(req => req.t("qtykidsRequired")),
  body('netImport').notEmpty().withMessage(req => req.t("netImportRequired")),
  body('discount').notEmpty().withMessage(req => req.t("discountRequired")),
  body('grossImport').notEmpty().withMessage(req => req.t("grossImportRequired")),
  body('stock').notEmpty().withMessage(req => req.t("stockRequired")),
  body('idtents').notEmpty().withMessage(req => req.t("idtentsRequired")),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      await promotionService.createPromotion(req.body, req.files);
      res.status(201).json({ message: req.t("message.promotionCreated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToCreatePromotion") });
      }
    }
  }
];

export const updatePromotion = [
  param('id').notEmpty().withMessage(req => req.t("idRequired")),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      await promotionService.updatePromotion(Number(req.params.id), req.body ,req.files);
      res.json({ message: req.t("message.promotionUpdated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("failedToUpdatePromotion") });
      }
    }
  }
];

export const deletePromotion = async (req: Request, res: Response) => {
  try {
    await promotionService.deletePromotion(Number(req.params.id));
    res.json({ message: req.t("message.promotionDeleted") });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToDeletePromotion") });
    }
  }
};


