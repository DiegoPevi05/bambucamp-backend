import express from 'express';
import * as reserveController from '../controllers/reserveController';
import { authenticateToken, checkRole } from '../middleware/auth';
const router = express.Router();


router.get('/calendar',reserveController.getCalendarDates);

router.get('/tents',reserveController.getAllPublicTentsForReservation);
router.get('/tents/admin',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.getAdminTentsForReservation);
router.get('/me',authenticateToken,checkRole('CLIENT'),reserveController.getAllMyReservesUser);
router.get('/me/calendar',authenticateToken,checkRole('CLIENT'),reserveController.getAllMyReservesCalendarUser);
router.get('/me/admin',authenticateToken,checkRole('ADMIN','SUPERVISOR'),reserveController.getAllMyReservesAdmin);
router.get('/me/admin/calendar',authenticateToken,checkRole('ADMIN','SUPERVISOR'),reserveController.getAllMyReservesCalendar);


router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),reserveController.getAllReserves);
router.get('/options',authenticateToken,checkRole('ADMIN','SUPERVISOR'),reserveController.getAllReserveOptions);
router.post('/reserve', reserveController.createReserveByUser);
router.post('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.createReserve);
router.put('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.updateReserve);
router.delete('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.deleteReserve);

router.post('/reserve/product',authenticateToken,checkRole('CLIENT'), reserveController.createProductReserveByUser);
router.post('/reserve/product/admin',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.createProductReserve);
router.delete('/reserve/product/admin/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.deleteProductReserve);



router.post('/reserve/experience',authenticateToken,checkRole('CLIENT'), reserveController.createExperienceReserveByUser);
router.post('/reserve/experience/admin',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.createExperienceReserve);
router.delete('/reserve/experience/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.deleteExperienceReserve);

router.get('/bill/:id',authenticateToken,checkRole('CLIENT','ADMIN','SUPERVISOR'),reserveController.downloadReserveBill);

router.post('/reserve/confirm',authenticateToken,checkRole('ADMIN','SUPERVISOR'), reserveController.confirmEntity);

export default router;

