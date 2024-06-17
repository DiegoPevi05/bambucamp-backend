import { Request, Response } from 'express';
import * as productService from '../services/productService';
import { body, param, validationResult } from 'express-validator';
import { serializeImagesTodb } from '../lib/utils';

// Define a custom type for the Multer file
type MulterFile = Express.Multer.File;

export const getAllPublicProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllPublicProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const createProduct = [
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').notEmpty().withMessage('Price is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await productService.createProduct(req.body, serializeImagesTodb(req.files  as { [fieldname: string]: MulterFile[] }));
      res.status(201).json({ message: 'Product created' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
];

export const updateProduct = [
  param('id').notEmpty().withMessage('Id is required'),

  async (req: Request, res: Response) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await productService.updateProduct(Number(req.params.id), req.body ,serializeImagesTodb(req.files  as { [fieldname: string]: MulterFile[] }) );
      res.json({ message: 'Product updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
];

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await productService.deleteProduct(Number(req.params.id));
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};


