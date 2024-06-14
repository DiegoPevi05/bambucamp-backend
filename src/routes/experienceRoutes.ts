import express from 'express';
import * as experienceController from '../controllers/experienceController';
import { authenticateToken, checkRole } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR','CLIENT'),experienceController.getAllExperiences);
router.post('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),upload.array('imgRoutes', 10), experienceController.createExperience);
router.put('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'),upload.array('imgRoutes', 10), experienceController.updateExperience);
router.delete('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), experienceController.deleteExperience);

export default router;

