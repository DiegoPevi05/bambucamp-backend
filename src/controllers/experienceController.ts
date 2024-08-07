import { Request, Response } from 'express';
import * as experienceService from '../services/experienceService';
import { body, param, validationResult } from 'express-validator';

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
    const { name, status, page = '1', pageSize = '10' } = req.query;

    const filters = {
      name: name as string | undefined,
      status: status as string | undefined
    };

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const PaginatedExperiences = await experienceService.getAllExperiences(filters, pagination);

    res.json(PaginatedExperiences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
};

export const createExperience = [
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('header').notEmpty().withMessage('Header is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').notEmpty().withMessage('Price is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('qtypeople').notEmpty().withMessage('Cantidad de personas es requerido'),
  body('limit_age').notEmpty().withMessage('Limite de edad requerido'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await experienceService.createExperience(req.body, req.files);
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
      await experienceService.updateExperience(Number(req.params.id), req.body ,req.files );
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


