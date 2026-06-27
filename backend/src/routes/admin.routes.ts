import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorizeType } from '../middleware/auth.middleware';

const router = Router();
const controller = new AdminController();

router.post('/login', controller.login);
router.get('/dashboard', authenticate, authorizeType('admin'), controller.getDashboard);
router.get('/users', authenticate, authorizeType('admin'), controller.getUsers);
router.put('/users/:userId/status', authenticate, authorizeType('admin'), controller.updateUserStatus);
router.delete('/users/:userId', authenticate, authorizeType('admin'), controller.deleteUser);
router.get('/experts', authenticate, authorizeType('admin'), controller.getExperts);
router.put('/experts/:expertId/verify', authenticate, authorizeType('admin'), controller.verifyExpert);
router.put('/experts/:expertId/status', authenticate, authorizeType('admin'), controller.updateExpertStatus);
router.get('/sos-alerts', authenticate, authorizeType('admin'), controller.getSOSAlerts);
router.put('/sos-alerts/:alertId/escalate', authenticate, authorizeType('admin'), controller.escalateAlert);
router.get('/consultations', authenticate, authorizeType('admin'), controller.getConsultations);
router.get('/transactions', authenticate, authorizeType('admin'), controller.getTransactions);
router.get('/revenue', authenticate, authorizeType('admin'), controller.getRevenue);
router.get('/settings', authenticate, authorizeType('admin'), controller.getSettings);
router.put('/settings', authenticate, authorizeType('admin'), controller.updateSettings);

export { router as adminRoutes };
