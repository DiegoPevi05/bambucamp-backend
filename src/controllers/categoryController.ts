import { Request, Response } from 'express';
import * as categoryService from '../services/categoryService';
import { body, param, validationResult } from 'express-validator';

/*********************** EXPERIENCE CATEGORY CONTROLLERS ***************************/

export const getAllExperiencesCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllExperiencesCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export const createExperienceCategory = [
  body('name').notEmpty().withMessage('Name is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const category = await categoryService.createExperienceCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
]

export const updateExperienceCategory = [
  param('id').notEmpty().withMessage('Id is required'),
  body('name').notEmpty().withMessage('Name is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const category = await categoryService.updateExperienceCategory(Number(req.params.id),req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
]

export const deleteExperienceCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.deleteExperienceCategory(Number(req.params.id));
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

/*********************** PRODUCT CATEGORY CONTROLLERS ***************************/

export const getAllProductCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllProductCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export const createProductCategory = [
  body('name').notEmpty().withMessage('Name is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const category = await categoryService.createProductCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
]


export const updateProductCategory = [
  param('id').notEmpty().withMessage('Id is required'),
  body('name').notEmpty().withMessage('Name is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const category = await categoryService.updateProductCategory(Number(req.params.id),req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
]

export const deleteProductCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.deleteProductCategory(Number(req.params.id));
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
}
