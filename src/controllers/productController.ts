import { Request, Response } from 'express';
import * as productService from '../services/productService';
import { body, param, validationResult } from 'express-validator';
import {CustomError} from '../middleware/errors';

export const getAllPublicProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllPublicProducts();
    res.json(products);
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchProducts") });
    }
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
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

    const PaginatedProducts = await productService.getAllProducts(filters, pagination);

    res.json(PaginatedProducts);

  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("error.failedToFetchProducts") });
    }
  }
};

export const createProduct = [
  body('categoryId').notEmpty().withMessage(req => req.t("validation.categoryIdRequired")),
  body('name').notEmpty().withMessage(req => req.t("validation.nameRequired")),
  body('description').notEmpty().withMessage(req => req.t("validation.descriptionRequired")),
  body('price').notEmpty().withMessage(req => req.t("validation.priceRequired")),
  body('stock').notEmpty().withMessage(req => req.t("validation.stockRequired")),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      await productService.createProduct(req.body, req.files);
      res.status(201).json({ message: req.t("message.productCreated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToCreateProduct") });
      }
    }
  }
];

export const updateProduct = [
  param('id').notEmpty().withMessage(req => req.t("validation.idRequired")),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      await productService.updateProduct(Number(req.params.id), req.body  , req.files );
      res.json({ message: req.t("message.productCreated") });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: req.t(error.message) });
      } else {
        res.status(500).json({ error: req.t("error.failedToUpdateProduct") });
      }
    }
  }
];

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await productService.deleteProduct(Number(req.params.id));
    res.json({ message: req.t("message.productDeleted") });
  } catch (error) {

    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: req.t(error.message) });
    } else {
      res.status(500).json({ error: req.t("failedToDeleteProduct") });
    }
  }
};


