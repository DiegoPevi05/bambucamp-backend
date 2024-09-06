import express from 'express';
import * as notificationController from '../controllers/notificationController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();


router.get('/user',authenticateToken,checkRole('CLIENT'),notificationController.getAllNotificationsUser);
router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),notificationController.getAllNotifications);
router.put('/:id',authenticateToken,checkRole('CLIENT'), notificationController.updateisRead);

export default router;

