import { Request, Response } from 'express';
import * as categoryService from '../services/categoryService';
import { body, param, validationResult } from 'express-validator';

/*********************** EXPERIENCE CATEGORY CONTROLLERS ***************************/

export const getAllExperiencesCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllExperiencesCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: req.t("error.failedToFetchExperienceCategories") });
  }
}

export const createExperienceCategory = [
  body('name').notEmpty().withMessage('validation.nameRequired'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      await categoryService.createExperienceCategory(req.body);
      res.status(201).json({ message: req.t('message.categoryExperienceCreated') });
    } catch (error) {
      res.status(500).json({ error: req.t("error.failedToCreateExperienceCategory") });
    }
  }
]

export const updateExperienceCategory = [
  param('id').notEmpty().withMessage('validation.idRequired'),
  body('name').notEmpty().withMessage('validation.nameRequired'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      await categoryService.updateExperienceCategory(Number(req.params.id),req.body);
      res.json({ message: req.t('message.categoryExperienceUpdated') });
    } catch (error) {
      res.status(500).json({ error: req.t('error.failedToUpdateExperienceCategory') });
    }
  }
]

export const deleteExperienceCategory = async (req: Request, res: Response) => {
  try {
    await categoryService.deleteExperienceCategory(Number(req.params.id));
    res.json({ message: req.t("message.categoryExperienceDeleted") });
  } catch (error) {
    res.status(500).json({ error: "error.failedToDeleteExperienceCategory" });
  }
}

/*********************** PRODUCT CATEGORY CONTROLLERS ***************************/

export const getAllProductCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllProductCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: req.t("error.failedToFetchProductCategories")});
  }
}

export const createProductCategory = [
  body('name').notEmpty().withMessage('validation.nameRequired'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      await categoryService.createProductCategory(req.body);
      res.status(201).json({ message: req.t("message.categoryProductCreated") });
    } catch (error) {
      res.status(500).json({ error: req.t("error.failedToCreateProductCategory") });
    }
  }
]


export const updateProductCategory = [
  param('id').notEmpty().withMessage("validation.idRequired"),
  body('name').notEmpty().withMessage("validation.nameRequired"),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const localizedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg)
      }));

      return res.status(400).json({ error: localizedErrors });
    }

    try {
      await categoryService.updateProductCategory(Number(req.params.id),req.body);
      res.json({ message: req.t("message.categoryProductUpdated") });
    } catch (error) {
      res.status(500).json({ error: req.t("error.failedToUpdateProductCategory") });
    }
  }
]

export const deleteProductCategory = async (req: Request, res: Response) => {
  try {
    await categoryService.deleteProductCategory(Number(req.params.id));
    res.json({ message: req.t("message.categoryProductDeleted") });
  } catch (error) {
    res.status(500).json({ error: req.t("error.failedToDeleteProductCategory")});
  }
}
