import { Router } from 'express';
import { SOSController } from '../controllers/sos.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const controller = new SOSController();

router.post('/activate', authenticate, controller.activateSOS);
router.post('/deactivate/:alertId', authenticate, controller.deactivateSOS);
router.get('/active', authenticate, controller.getActiveAlert);
router.get('/history', authenticate, controller.getAlertHistory);
router.get('/:alertId', authenticate, controller.getAlertDetails);
router.post('/location-update', authenticate, controller.updateLocation);
router.post('/evidence/audio', authenticate, controller.uploadAudioEvidence);
router.post('/evidence/photo', authenticate, controller.uploadPhotoEvidence);
router.post('/evidence/video', authenticate, controller.uploadVideoEvidence);
router.get('/contacts', authenticate, controller.getEmergencyContacts);
router.post('/contacts', authenticate, controller.addEmergencyContact);
router.put('/contacts/:contactId', authenticate, controller.updateEmergencyContact);
router.delete('/contacts/:contactId', authenticate, controller.deleteEmergencyContact);
router.post('/checkin/schedule', authenticate, controller.scheduleCheckin);
router.post('/checkin/respond/:checkinId', authenticate, controller.respondToCheckin);
router.get('/checkins', authenticate, controller.getCheckins);
router.get('/nearby', authenticate, controller.getNearbyAlerts);
router.post('/respond/:alertId', authenticate, controller.respondToAlert);

export { router as sosRoutes };
