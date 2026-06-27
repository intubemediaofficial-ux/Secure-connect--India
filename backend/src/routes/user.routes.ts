import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new UserController();

router.get('/profile', authenticate, controller.getProfile);
router.put('/profile', authenticate, controller.updateProfile);
router.post('/profile/avatar', authenticate, controller.uploadAvatar);
router.get('/settings', authenticate, controller.getSettings);
router.put('/settings', authenticate, controller.updateSettings);
router.get('/trusted-locations', authenticate, controller.getTrustedLocations);
router.post('/trusted-locations', authenticate, controller.addTrustedLocation);
router.delete('/trusted-locations/:locationId', authenticate, controller.removeTrustedLocation);

export { router as userRoutes };
