import express from 'express';
import * as reserveController from '../controllers/reserveController';
import { authenticateToken, checkRole } from '../middleware/auth';
const router = express.Router();


router.get('/me',authenticateToken,checkRole('CLIENT'),reserveController.getAllMyReserves);
router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),reserveController.getAllReserves);
router.post('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.createReserve);
router.put('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.updateReserve);
router.delete('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.deleteReserve);

export default router;

