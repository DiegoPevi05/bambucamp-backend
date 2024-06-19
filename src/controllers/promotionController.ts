import { Request, Response } from 'express';
import * as promotionService from '../services/promotionService';
import { body, param, validationResult } from 'express-validator';
import { serializeImagesTodb } from '../lib/utils';

// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const getAllPublicPromotions = async (req: Request, res: Response) => {
  try {
    const promotions = await promotionService.getAllPublicPromotions();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
};

export const getAllPromotions = async (req: Request, res: Response) => {
  try {
    const promotions = await promotionService.getAllPromotions();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
};

export const createPromotion = [
  body('code').notEmpty().withMessage('Code is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('qtypeople').notEmpty().withMessage('Quantity of people is required'),
  body('qtykids').notEmpty().withMessage('Quantity of kids is required'),
  body('idtents').notEmpty().withMessage('Id tents is required'),
  body('stock').notEmpty().withMessage('Stock is required'),
  body('discount').notEmpty().withMessage('Discount is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await promotionService.createPromotion(req.body, serializeImagesTodb(req.files  as { [fieldname: string]: MulterFile[] }));
      res.status(201).json({ message: 'Promotion created' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to create promotion' });
    }
  }
];

export const updatePromotion = [
  param('id').notEmpty().withMessage('Id is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await promotionService.updatePromotion(Number(req.params.id), req.body ,serializeImagesTodb(req.files  as { [fieldname: string]: MulterFile[] }) );
      res.json({ message: 'Promotion updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update promotion' });
    }
  }
];

export const deletePromotion = async (req: Request, res: Response) => {
  try {
    await promotionService.deletePromotion(Number(req.params.id));
    res.json({ message: 'Promotion deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete promotion' });
  }
};


