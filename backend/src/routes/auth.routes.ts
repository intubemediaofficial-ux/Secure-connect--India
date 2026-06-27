import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new AuthController();

router.post('/send-otp', controller.sendOTP);
router.post('/verify-otp', controller.verifyOTP);
router.post('/resend-otp', controller.resendOTP);
router.post('/send-email-otp', controller.sendEmailOTP);
router.post('/verify-email-otp', controller.verifyEmailOTP);
router.post('/verify-email', authenticate, controller.verifyEmail);
router.post('/send-email-verification', authenticate, controller.sendEmailVerification);
router.post('/refresh-token', controller.refreshToken);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.getProfile);
router.post('/expert/register', controller.registerExpert);
router.post('/expert/login', controller.expertLogin);

export { router as authRoutes };
