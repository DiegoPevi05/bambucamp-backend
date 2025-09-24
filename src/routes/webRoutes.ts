import express from 'express';
import * as webController from '../controllers/webController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/',webController.getWebContent);
router.post('/contact',webController.contactForm);
router.post('/complaint',webController.complaintForm);


router.get('/faqs',authenticateToken,checkRole('ADMIN','SUPERVISOR'),webController.getAllFaqs);
router.post('/faqs',authenticateToken,checkRole('ADMIN','SUPERVISOR'), webController.createFaq);
router.delete('/faqs/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), webController.deleteFaq);

router.get('/reviews',authenticateToken,checkRole('ADMIN','SUPERVISOR'),webController.getAllReviews);
router.post('/reviews',authenticateToken,checkRole('ADMIN','SUPERVISOR'), webController.createReview);
router.delete('/reviews/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), webController.deleteReview);


export default router;

