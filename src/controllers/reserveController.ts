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


export const getAllReserves = async (req: Request, res: Response) => {
  try {
    const reserves = await reserveService.getAllReserves();
    res.json(reserves);
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


