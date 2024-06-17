import express from 'express';
import * as experienceController from '../controllers/experienceController';
import { authenticateToken, checkRole } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

const uploadFields = [
  { name: 'images', maxCount: 10 }
];

router.get('/public',experienceController.getAllPublicExperiences);
router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),experienceController.getAllExperiences);
router.post('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),upload.fields(uploadFields), experienceController.createExperience);
router.put('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'),upload.fields(uploadFields), experienceController.updateExperience);
router.delete('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), experienceController.deleteExperience);

export default router;

