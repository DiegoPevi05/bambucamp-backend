import { Request, Response } from 'express';
import * as experienceService from '../services/experienceService';
import { body, param, validationResult } from 'express-validator';
import {CustomError} from '../middleware/errors';

export const getAllPublicExperiences = async (req: Request, res: Response) => {
  try {
    const experiences = await experienceService.getAllPublicExperiences();
    res.json(experiences);
  } catch (error) {

    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchExperiences") });
    }
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
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchExperiences") });
    }
  }
};

export const createExperience = [
  body('categoryId').notEmpty().withMessage(req => req.t("validation.categoryIdRequired")),
  body('header').notEmpty().withMessage(req => req.t("validation.headerRequired")),
  body('name').notEmpty().withMessage(req => req.t("validation.nameRequired")),
  body('description').notEmpty().withMessage(req => req.t("validation.descriptionRequired")),
  body('price').notEmpty().withMessage(req => req.t("validation.priceRequired")),
  body('duration').notEmpty().withMessage(req => req.t("validation.durationRequired")),
  body('qtypeople').notEmpty().withMessage(req => req.t("validation.qtypeopleRequired")),
  body('limit_age').notEmpty().withMessage(req => req.t("validation.limit_ageRequired")),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      await experienceService.createExperience(req.body, req.files);
      res.status(201).json({ message: req.t("message.experienceCreated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToCreateExperience") });
      }
    }
  }
];

export const updateExperience = [
  param('id').notEmpty().withMessage(req => req.t("validation.idRequired")),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      await experienceService.updateExperience(Number(req.params.id), req.body ,req.files );
      res.json({ message: req.t("message.experienceUpdated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToUpdateExperience") });
      }
    }
  }
];

export const deleteExperience = async (req: Request, res: Response) => {
  try {
    await experienceService.deleteExperience(Number(req.params.id));
    res.json({ message: req.t("message.experienceDeleted") });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToDeleteExperience") });
    }
  }
};


