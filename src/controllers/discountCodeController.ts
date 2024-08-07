import { Request, Response } from 'express';
import * as discountCodeService from '../services/discountCodeService';
import { body, query, param, validationResult } from 'express-validator';

export const validateDiscountCode = [
  query('code').notEmpty().withMessage('Code is required'),

  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await discountCodeService.getDiscountCodeByCode(req.query.code as string);
      res.json({ message: 'Valid promotion code' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to validate promotion code' });
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
    res.status(500).json({ error: 'Failed to fetch discountCodes' });
  }
};

export const createDiscountCode = [
  body('code').notEmpty().withMessage('Codigo es requerido'),
  body('discount').notEmpty().withMessage('Descuento es requerido'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await discountCodeService.createDiscountCode(req.body);
      res.status(201).json({ message: 'DiscountCode created' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to create discountCode' });
    }
  }
];

export const updateDiscountCode = [
  param('id').notEmpty().withMessage('Id is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await discountCodeService.updateDiscountCode(Number(req.params.id), req.body);
      res.json({ message: 'DiscountCode updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update discountCode' });
    }
  }
];

export const deleteDiscountCode = async (req: Request, res: Response) => {
  try {
    await discountCodeService.deleteDiscountCode(Number(req.params.id));
    res.json({ message: 'DiscountCode deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete discountCode' });
  }
};


