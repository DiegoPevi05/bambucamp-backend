import { Request, Response } from 'express';
import * as reserveService from '../services/reserveService';
import { body, param, validationResult } from 'express-validator';


export const getAllMyReserves = [
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const reserves = await reserveService.getAllMyReserves(req.user.id);
      res.json(reserves);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to fetch reserves' });
    }
  }
] 

export const getAllReserveOptions = async( req:Request, res:Response ) => {
  try {
    const reserveOptions = await reserveService.getAllReseveOptions();
    res.json(reserveOptions);
  } catch (error) {

    res.status(500).json({ error: 'Failed to fetch promotions options' });
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
    res.status(500).json({ error: 'Failed to fetch reserves' });
  }
};

export const createReserveByUser = [
  body('qtypeople').notEmpty().withMessage('Quantity of people is required'),
  body('qtykids').notEmpty().withMessage('Quantity of kids is required'),
  body('tents').isArray().withMessage('Tents must be an array'),
  body('products').isArray().withMessage('Products must be an array'),
  body('experiences').isArray().withMessage('Experiences must be an array'),
  body('dateFrom').notEmpty().withMessage('Date from is required'),
  body('dateTo').notEmpty().withMessage('Date to is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      };
      await reserveService.createReserveByUser(req.body, req.user.id);
      res.status(201).json({ message: 'Reserve created' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to create reserve' });
    }
  }
];

export const createReserve = [
  body('qtypeople').notEmpty().withMessage('Quantity of people is required'),
  body('qtykids').notEmpty().withMessage('Quantity of kids is required'),
  body('userId').notEmpty().withMessage('User id is required'),
  body('tents').isArray().withMessage('Tents must be an array'),
  body('products').isArray().withMessage('Products must be an array'),
  body('experiences').isArray().withMessage('Experiences must be an array'),
  body('dateFrom').notEmpty().withMessage('Date from is required'),
  body('dateTo').notEmpty().withMessage('Date to is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await reserveService.createReserve(req.body);
      res.status(201).json({ message: 'Reserve created' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to create reserve' });
    }
  }
];

export const updateReserve = [
  param('id').notEmpty().withMessage('Id is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await reserveService.updateReserve(Number(req.params.id), req.body);
      res.json({ message: 'Reserve updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update reserve' });
    }
  }
];

export const deleteReserve = async (req: Request, res: Response) => {
  try {
    await reserveService.deleteReserve(Number(req.params.id));
    res.json({ message: 'Reserve deleted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to delete reserve' });
  }
};


