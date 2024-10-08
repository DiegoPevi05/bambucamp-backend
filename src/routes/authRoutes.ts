import express from 'express';
import * as authController from '../controllers/authController';

const router = express.Router();

//router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.get('/verify-email',authController.verifyAccount);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-password-reset-code', authController.verifyPasswordResetCode);
router.post('/update-password', authController.updatePassword);

export default router;
