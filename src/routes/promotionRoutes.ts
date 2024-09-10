import express from 'express';
import * as promotionController from '../controllers/promotionController';
import { authenticateToken, checkRole } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

const uploadFields = [
  { name: 'images', maxCount: 10 }
];

router.get('/public',promotionController.getAllPublicPromotions);
router.get('/validate', promotionController.validatePromotionAvailability);
router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),promotionController.getAllPromotions);
router.get('/options',authenticateToken,checkRole('ADMIN','SUPERVISOR'),promotionController.getAllPromotionOptions);
router.post('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),upload.fields(uploadFields), promotionController.createPromotion);
router.put('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'),upload.fields(uploadFields), promotionController.updatePromotion);
router.delete('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), promotionController.deletePromotion);

export default router;

