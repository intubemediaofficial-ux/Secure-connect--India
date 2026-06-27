import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new ChatController();

router.get('/messages/:consultationId', authenticate, controller.getMessages);
router.post('/send', authenticate, controller.sendMessage);
router.post('/read/:consultationId', authenticate, controller.markAsRead);
router.post('/upload', authenticate, controller.uploadMedia);

export { router as chatRoutes };
