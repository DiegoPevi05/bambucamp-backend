import { Request, Response } from 'express';
import * as experienceService from '../services/experienceService';
import { body, param, validationResult } from 'express-validator';
import { serializeImagesTodb } from '../lib/utils';

// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const getAllPublicExperiences = async (req: Request, res: Response) => {
  try {
    const experiences = await experienceService.getAllPublicExperiences();
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
};

export const getAllExperiences = async (req: Request, res: Response) => {
  try {
    const experiences = await experienceService.getAllExperiences();
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
};

export const createExperience = [
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('header').notEmpty().withMessage('Header is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').notEmpty().withMessage('Price is required'),
  body('duration').notEmpty().withMessage('Duration is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await experienceService.createExperience(req.body, serializeImagesTodb(req.files  as { [fieldname: string]: MulterFile[] }));
      res.status(201).json({ message: 'Experience created' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to create experience' });
    }
  }
];

export const updateExperience = [
  param('id').notEmpty().withMessage('Id is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await experienceService.updateExperience(Number(req.params.id), req.body ,serializeImagesTodb(req.files  as { [fieldname: string]: MulterFile[] }) );
      res.json({ message: 'Experience updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update experience' });
    }
  }
];

export const deleteExperience = async (req: Request, res: Response) => {
  try {
    await experienceService.deleteExperience(Number(req.params.id));
    res.json({ message: 'Experience deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete experience' });
  }
};


