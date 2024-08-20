import express from 'express';
import * as chatController from '../controllers/chatController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'), chatController.getAllWebChats);
router.get('/messages/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), chatController.getMessages);


export default router;
