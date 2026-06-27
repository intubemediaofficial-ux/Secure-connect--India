import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new NotificationController();

router.get('/', authenticate, controller.getNotifications);
router.put('/read/:notificationId', authenticate, controller.markAsRead);
router.put('/read-all', authenticate, controller.markAllAsRead);
router.delete('/:notificationId', authenticate, controller.deleteNotification);

export { router as notificationRoutes };
