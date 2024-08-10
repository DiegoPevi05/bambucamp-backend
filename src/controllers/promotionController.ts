import { Request, Response } from 'express';
import * as promotionService from '../services/promotionService';
import { body, param, validationResult } from 'express-validator';

export const getAllPublicPromotions = async (req: Request, res: Response) => {
  try {
    const promotions = await promotionService.getAllPublicPromotions();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
};

export const getAllPromotionOptions = async( req:Request, res:Response ) => {
  try {
    const promotionsOptions = await promotionService.getAllPromotionOptions();
    res.json(promotionsOptions);
  } catch (error) {

    res.status(500).json({ error: 'Failed to fetch promotions options' });
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
    console.log(error)
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
};

export const createPromotion = [
  body('title').notEmpty().withMessage('Titulo is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('expiredDate').notEmpty().withMessage('Expired Date is required'),
  body('status').notEmpty().withMessage('Status is required'),
  body('qtypeople').notEmpty().withMessage('Quantity of people is required'),
  body('qtykids').notEmpty().withMessage('Quantity of kids is required'),
  body('netImport').notEmpty().withMessage('Net Import is required'),
  body('discount').notEmpty().withMessage('Discount is required'),
  body('grossImport').notEmpty().withMessage('Gross Import is required'),
  body('stock').notEmpty().withMessage('Stock is required'),
  body('idtents').notEmpty().withMessage('Id tents is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await promotionService.createPromotion(req.body, req.files);
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
      await promotionService.updatePromotion(Number(req.params.id), req.body ,req.files);
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


