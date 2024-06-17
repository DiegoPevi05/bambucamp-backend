import express from 'express';
import * as tentController from '../controllers/tentController';
import { authenticateToken, checkRole } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

const uploadFields = [
  { name: 'images', maxCount: 10 }
];

router.get('/public',tentController.getAllPublicTents);
router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),tentController.getAllTents);
router.post('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),upload.fields(uploadFields), tentController.createTent);
router.put('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'),upload.fields(uploadFields), tentController.updateTent);
router.delete('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), tentController.deleteTent);

export default router;

