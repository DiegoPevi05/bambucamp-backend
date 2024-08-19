import express from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();


router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR','CLIENT'),notificationController.getAllNotifications);
router.put('/:id',authenticateToken,checkRole('CLIENT'), notificationController.updateisRead);

export default router;

