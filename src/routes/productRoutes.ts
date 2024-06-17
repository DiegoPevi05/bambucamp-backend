import express from 'express';
import * as productController from '../controllers/productController';
import { authenticateToken, checkRole } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

const uploadFields = [
  { name: 'images', maxCount: 10 }
];

router.get('/public',productController.getAllPublicProducts);
router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),productController.getAllProducts);
router.post('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),upload.fields(uploadFields), productController.createProduct);
router.put('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'),upload.fields(uploadFields), productController.updateProduct);
router.delete('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), productController.deleteProduct);

export default router;

