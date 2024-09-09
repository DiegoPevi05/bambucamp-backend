import { Request, Response } from 'express';
import * as discountCodeService from '../services/discountCodeService';
import { body, query, param, validationResult } from 'express-validator';
import {CustomError} from '../middleware/errors';

export const validateDiscountCode = [
  query('code').notEmpty().withMessage("validation.codeRequired"),

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
      const discountedCode = await discountCodeService.getDiscountCodeByCode(req.query.code as string);
      res.json({...discountedCode, message: req.t("message.validCode") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t('error.failedToValidateCode') });
      }
    }
  }
];

export const getAllDiscountCodes = async (req: Request, res: Response) => {
  try {

    const { code, status, page = '1', pageSize = '10' } = req.query;

    const filters = {
      code: code as string | undefined,
      status: status as string | undefined
    };

    const pagination = {
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10),
    };

    const PaginatedDiscountCodes = await discountCodeService.getAllDiscountCodes(filters, pagination);

    res.json(PaginatedDiscountCodes);
  } catch (error) {

    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchDiscountCodes") });
    }
  }
};

export const createDiscountCode = [
  body('code').notEmpty().withMessage("codeRequired"),
  body('discount').notEmpty().withMessage("discountRequired"),

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
      await discountCodeService.createDiscountCode(req.body);
      res.status(201).json({ message: req.t("message.discountCodeCreated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToCreateDiscountCode") });
      }
    }
  }
];

export const updateDiscountCode = [
  param('id').notEmpty().withMessage("idRequired"),

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
      await discountCodeService.updateDiscountCode(Number(req.params.id), req.body);
      res.json({ message: req.t("message.discountCodeUpdated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToUpdateDiscountCode")});
      }
    }
  }
];

export const deleteDiscountCode = async (req: Request, res: Response) => {
  try {
    await discountCodeService.deleteDiscountCode(Number(req.params.id));
    res.json({ message: req.t("message.discountCodeDeleted") });
  } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToDeleteDiscountCode") });
      }
  }
};


