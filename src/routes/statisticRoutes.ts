import express from 'express';
import * as statisticController from '../controllers/statisticController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/net-import',authenticateToken,checkRole('ADMIN','SUPERVISOR'),statisticController.getNetSalesStatistics);
router.get('/reserves',authenticateToken,checkRole('ADMIN','SUPERVISOR'),statisticController.getReserveQuantityStatistics);



export default router;

