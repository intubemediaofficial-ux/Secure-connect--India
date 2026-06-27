import { Router } from 'express';
import { ExpertController } from '../controllers/expert.controller';
import { authenticate, authorizeType } from '../middleware/auth.middleware';

const router = Router();
const controller = new ExpertController();

router.get('/profile', authenticate, authorizeType('expert'), controller.getProfile);
router.put('/profile', authenticate, authorizeType('expert'), controller.updateProfile);
router.get('/availability', authenticate, authorizeType('expert'), controller.getAvailability);
router.put('/availability', authenticate, authorizeType('expert'), controller.updateAvailability);
router.post('/go-online', authenticate, authorizeType('expert'), controller.goOnline);
router.post('/go-offline', authenticate, authorizeType('expert'), controller.goOffline);
router.get('/dashboard', authenticate, authorizeType('expert'), controller.getDashboard);
router.get('/consultations', authenticate, authorizeType('expert'), controller.getConsultations);
router.get('/ratings', authenticate, authorizeType('expert'), controller.getRatings);

export { router as expertRoutes };
