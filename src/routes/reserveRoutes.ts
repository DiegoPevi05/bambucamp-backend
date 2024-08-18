import express from 'express';
import * as reserveController from '../controllers/reserveController';
import { authenticateToken, checkRole } from '../middleware/auth';
const router = express.Router();


router.get('/me',authenticateToken,checkRole('CLIENT'),reserveController.getAllMyReservesUser);
router.get('/me/admin',authenticateToken,checkRole('ADMIN','SUPERVISOR'),reserveController.getAllMyReservesAdmin);
router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),reserveController.getAllReserves);
router.get('/options',authenticateToken,checkRole('ADMIN','SUPERVISOR'),reserveController.getAllReserveOptions);
router.post('/reserve',authenticateToken,checkRole('CLIENT'), reserveController.createReserveByUser);
router.post('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.createReserve);
router.put('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.updateReserve);
router.delete('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.deleteReserve);

export default router;

