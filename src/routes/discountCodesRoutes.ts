import express from 'express';
import * as discountCodeController from '../controllers/discountCodeController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();


router.get('/validate-code',discountCodeController.validateDiscountCode);
router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),discountCodeController.getAllDiscountCodes);
router.post('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'), discountCodeController.createDiscountCode);
router.put('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), discountCodeController.updateDiscountCode);
router.delete('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), discountCodeController.deleteDiscountCode);

export default router;

