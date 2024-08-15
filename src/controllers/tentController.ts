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
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch tents' });
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
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch tents' });
    }

  }
};

export const createTent = [
  body('header').notEmpty().withMessage('Header is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('services').notEmpty().withMessage('Services is required'),
  body('qtypeople').notEmpty().withMessage('Quantity of people is required'),
  body('qtykids').notEmpty().withMessage('Quantity of kids is required'),
  body('price').notEmpty().withMessage('Price is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      req.files
      // Create the tent
      await tentService.createTent(req.body, req.files);

      res.status(201).json({ message: 'Tent created' });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create promotion' });
      }
    }
  }
];

export const updateTent = [
  param('id').notEmpty().withMessage('Id is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {

      await tentService.updateTent(Number(req.params.id), req.body , req.files);

      res.json({ message: 'Tent updated' });

    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update tent' });
      }
    }
  }
];

export const deleteTent = async (req: Request, res: Response) => {
  try {
    await tentService.deleteTent(Number(req.params.id));

    res.json({ message: 'Tent deleted' });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete tent' });
    }
  }
};


