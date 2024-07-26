import express from 'express';
import * as userController from '../controllers/userController';
import { authenticateToken, checkRole } from '../middleware/auth';

const router = express.Router();

router.get('/me',authenticateToken,userController.getMe);
router.get('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'),userController.getAllUsers);
router.get('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), userController.getUserById);
router.post('/',authenticateToken,checkRole('ADMIN','SUPERVISOR'), userController.createUser);
router.put('/:id/disable',authenticateToken,checkRole('ADMIN','SUPERVISOR'), userController.disableUser);
router.put('/:id/enable',authenticateToken,checkRole('ADMIN','SUPERVISOR'), userController.enableUser);
router.put('/:id',authenticateToken,checkRole('ADMIN','SUPERVISOR'), userController.updateUser);
router.delete('/:id',authenticateToken,checkRole('ADMIN'), userController.deleteUser);

export default router;
