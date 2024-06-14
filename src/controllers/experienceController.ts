import { Request, Response } from 'express';
import * as experienceService from '../services/experienceService';
import { body, param, validationResult } from 'express-validator';


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
      await experienceService.createExperience(req.body);
      res.status(201).json({ message: 'Experience created' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create experience' });
    }
  }
];

export const updateExperience = [
  param('id').notEmpty().withMessage('Id is required'),
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
      await experienceService.updateExperience(Number(req.params.id), req.body);
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


