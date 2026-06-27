import { Router } from 'express';
import { ConsultationController } from '../controllers/consultation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new ConsultationController();

router.get('/experts', authenticate, controller.listExperts);
router.get('/experts/:expertId', authenticate, controller.getExpertProfile);
router.get('/experts/category/:category', authenticate, controller.getExpertsByCategory);
router.post('/request', authenticate, controller.requestConsultation);
router.post('/accept/:consultationId', authenticate, controller.acceptConsultation);
router.post('/reject/:consultationId', authenticate, controller.rejectConsultation);
router.post('/start/:consultationId', authenticate, controller.startConsultation);
router.post('/end/:consultationId', authenticate, controller.endConsultation);
router.get('/active', authenticate, controller.getActiveConsultation);
router.get('/history', authenticate, controller.getConsultationHistory);
router.get('/:consultationId', authenticate, controller.getConsultationDetails);
router.post('/rate/:consultationId', authenticate, controller.rateConsultation);
router.post('/favorite/:expertId', authenticate, controller.addFavorite);
router.delete('/favorite/:expertId', authenticate, controller.removeFavorite);
router.get('/favorites', authenticate, controller.getFavorites);

export { router as consultationRoutes };
