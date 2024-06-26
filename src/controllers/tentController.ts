import { Request, Response } from 'express';
import * as tentService from '../services/tentService';
import { body, query, param, validationResult } from 'express-validator';
import { serializeImagesTodb } from '../lib/utils';

// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const getAllPublicTents = async (req: Request, res: Response) => {
  try {
    const tents = await tentService.getAllPublicTents();
    res.json(tents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tents' });
  }
};

export const getAllTents = async (req: Request, res: Response) => {
  try {
    const tents = await tentService.getAllTents();
    res.json(tents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tents' });
  }
};

export const createTent = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('services').notEmpty().withMessage('Services is required'),
  body('qtypeople').notEmpty().withMessage('Quantity of people is required'),
  body('qtykids').notEmpty().withMessage('Quantity of kids is required'),
  body('price').notEmpty().withMessage('Price is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await tentService.createTent(req.body, serializeImagesTodb(req.files  as { [fieldname: string]: MulterFile[] }));
      res.status(201).json({ message: 'Tent created' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to create promotion' });
    }
  }
];

export const updateTent = [
  param('id').notEmpty().withMessage('Id is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await tentService.updateTent(Number(req.params.id), req.body ,serializeImagesTodb(req.files  as { [fieldname: string]: MulterFile[] }) );
      res.json({ message: 'Tent updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update tent' });
    }
  }
];

export const deleteTent = async (req: Request, res: Response) => {
  try {
    await tentService.deleteTent(Number(req.params.id));
    res.json({ message: 'Tent deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete tent' });
  }
};


