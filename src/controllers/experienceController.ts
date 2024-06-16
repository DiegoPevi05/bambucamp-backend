import { Request, Response } from 'express';
import * as experienceService from '../services/experienceService';
import { body, query, param, validationResult } from 'express-validator';
import { serializeImagesTodb } from '../lib/utils';
import { validateImgFiles } from '../middleware/fileValidation';
import {ExperienceDto} from '../dto/experience';

// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;


export const getAllExperiences = async (req: Request, res: Response) => {
  try {
    const experiences = await experienceService.getAllExperiences();
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
};

export const createExperience = [
  query('categoryId').notEmpty().withMessage('Category is required'),
  query('header').notEmpty().withMessage('Header is required'),
  query('title').notEmpty().withMessage('Title is required'),
  query('description').notEmpty().withMessage('Description is required'),
  query('price').notEmpty().withMessage('Price is required'),
  query('duration').notEmpty().withMessage('Duration is required'),
  validateImgFiles,

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const body:ExperienceDto = {
        categoryId: Number(req.query.categoryId),
        header: "hola",
        title: "hola",
        description: "hola",
        price: Number(req.query.price),
        duration: "hola",
        status: 'ACTIVE',
        createdAt: new Date(),
      }
      await experienceService.createExperience(body, serializeImagesTodb(req.files as MulterFile[] | undefined));
      res.status(201).json({ message: 'Experience created' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create experience' });
    }
  }
];

export const updateExperience = [
  param('id').notEmpty().withMessage('Id is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('categoryId').isNumeric().withMessage('Category must be a number'),
  body('header').notEmpty().withMessage('Header is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').notEmpty().withMessage('Price is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('duration').notEmpty().withMessage('Duration is required'),
  validateImgFiles,

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


