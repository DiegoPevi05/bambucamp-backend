import express from 'express';
import * as categoryController from '../controllers/categoryController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/experience',categoryController.getAllExperiencesCategories);
router.post('/experience',authenticateToken,checkRole('ADMIN','SUPERVISOR'), categoryController.createExperienceCategory);
router.put('/experience/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), categoryController.updateExperienceCategory);
router.delete('/experience/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), categoryController.deleteExperienceCategory);

router.get('/product',categoryController.getAllProductCategories);
router.post('/product',authenticateToken,checkRole('ADMIN','SUPERVISOR'), categoryController.createProductCategory);
router.put('/product/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), categoryController.updateProductCategory);
router.delete('/product/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), categoryController.deleteProductCategory);


export default router;
