import express from 'express';
import * as experienceController from '../controllers/experienceController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR','CLIENT'),experienceController.getAllExperiences);
router.post('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'), experienceController.createExperience);
router.put('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), experienceController.updateExperience);
router.delete('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), experienceController.deleteExperience);

export default router;

