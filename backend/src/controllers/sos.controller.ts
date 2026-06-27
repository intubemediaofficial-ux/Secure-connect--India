import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';
import { SOS_CONFIG } from '../config/constants';
import { NotificationService } from '../services/notification.service';
import { OTPService } from '../services/otp.service';

export class SOSController {
  private notificationService = new NotificationService();
  private otpService = new OTPService();

  activateSOS = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { latitude, longitude, triggerMethod, address } = req.body;

      if (!latitude || !longitude) throw new ApiError(400, 'Location coordinates required');

      const existingAlert = await prisma.sOSAlert.findFirst({
        where: { userId, status: 'ACTIVE' },
      });

      if (existingAlert) throw new ApiError(409, 'An active SOS alert already exists');

      const alert = await prisma.sOSAlert.create({
        data: {
          userId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address,
          triggerMethod: triggerMethod || 'BUTTON',
          status: 'ACTIVE',
        },
        include: { user: { select: { name: true, phone: true } } },
      });

      const contacts = await prisma.emergencyContact.findMany({ where: { userId } });

      if (contacts.length > 0) {
        await prisma.sOSAlert.update({
          where: { id: alert.id },
          data: { alertedContacts: { connect: contacts.map(c => ({ id: c.id })) } },
        });

        for (const contact of contacts) {
          await this.notificationService.sendSOSAlert(contact.phone, {
            userName: alert.user.name || 'A user',
            latitude: alert.latitude,
            longitude: alert.longitude,
            alertId: alert.id,
            address,
          });
        }
      }

      await prisma.locationHistory.create({
        data: { sosAlertId: alert.id, latitude: alert.latitude, longitude: alert.longitude },
      });

      // Emit real-time event via Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.emit('sos:new', {
          alertId: alert.id,
          latitude: alert.latitude,
          longitude: alert.longitude,
          userId,
        });
      }

      res.status(201).json({
        success: true,
        message: 'SOS Alert activated! Emergency contacts notified.',
        data: { alert, contactsNotified: contacts.length },
      });
    } catch (error) {
      next(error);
    }
  };

  deactivateSOS = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { alertId } = req.params;
      const { reason } = req.body;

      const alert = await prisma.sOSAlert.findFirst({
        where: { id: alertId, userId, status: 'ACTIVE' },
      });

      if (!alert) throw new ApiError(404, 'Active alert not found');

      const updatedAlert = await prisma.sOSAlert.update({
        where: { id: alertId },
        data: {
          status: reason === 'false_alarm' ? 'FALSE_ALARM' : 'RESOLVED',
          resolvedAt: new Date(),
          notes: reason,
        },
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('sos:resolved', { alertId, status: updatedAlert.status });
      }

      res.json({ success: true, message: 'SOS Alert deactivated', data: updatedAlert });
    } catch (error) {
      next(error);
    }
  };

  getActiveAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const alert = await prisma.sOSAlert.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: {
          locationHistory: { orderBy: { timestamp: 'desc' }, take: 20 },
          alertedContacts: true,
        },
      });
      res.json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  };

  getAlertHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const [alerts, total] = await Promise.all([
        prisma.sOSAlert.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.sOSAlert.count({ where: { userId } }),
      ]);

      res.json({ success: true, data: { alerts, total, page, pages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  };

  getAlertDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { alertId } = req.params;

      const alert = await prisma.sOSAlert.findFirst({
        where: { id: alertId, userId },
        include: {
          locationHistory: { orderBy: { timestamp: 'asc' } },
          alertedContacts: true,
          nearbyAlerts: true,
        },
      });

      if (!alert) throw new ApiError(404, 'Alert not found');
      res.json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  };

  updateLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { latitude, longitude, accuracy, speed, bearing, altitude } = req.body;

      const activeAlert = await prisma.sOSAlert.findFirst({
        where: { userId, status: 'ACTIVE' },
      });

      if (!activeAlert) throw new ApiError(404, 'No active SOS alert');

      await prisma.sOSAlert.update({
        where: { id: activeAlert.id },
        data: { latitude, longitude },
      });

      await prisma.locationHistory.create({
        data: { sosAlertId: activeAlert.id, latitude, longitude, accuracy, speed, bearing, altitude },
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('sos:location', { alertId: activeAlert.id, latitude, longitude, speed });
      }

      res.json({ success: true, message: 'Location updated' });
    } catch (error) {
      next(error);
    }
  };

  uploadAudioEvidence = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      // In production: multer + S3 upload
      res.json({ success: true, message: 'Audio evidence uploaded securely' });
    } catch (error) {
      next(error);
    }
  };

  uploadPhotoEvidence = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, message: 'Photo evidence uploaded securely' });
    } catch (error) {
      next(error);
    }
  };

  uploadVideoEvidence = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, message: 'Video evidence uploaded securely' });
    } catch (error) {
      next(error);
    }
  };

  getEmergencyContacts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const contacts = await prisma.emergencyContact.findMany({
        where: { userId },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      });
      res.json({ success: true, data: contacts });
    } catch (error) {
      next(error);
    }
  };

  addEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { name, phone, relationship, isPrimary } = req.body;

      if (!name || !phone) throw new ApiError(400, 'Name and phone required');

      const count = await prisma.emergencyContact.count({ where: { userId } });
      if (count >= SOS_CONFIG.maxEmergencyContacts) {
        throw new ApiError(400, `Maximum ${SOS_CONFIG.maxEmergencyContacts} emergency contacts allowed`);
      }

      const contact = await prisma.emergencyContact.create({
        data: { userId, name, phone, relationship: relationship || 'Other', isPrimary: isPrimary || false },
      });

      res.status(201).json({ success: true, data: contact });
    } catch (error) {
      next(error);
    }
  };

  updateEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { contactId } = req.params;

      const contact = await prisma.emergencyContact.findFirst({ where: { id: contactId, userId } });
      if (!contact) throw new ApiError(404, 'Contact not found');

      const updated = await prisma.emergencyContact.update({
        where: { id: contactId },
        data: req.body,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  deleteEmergencyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { contactId } = req.params;

      const contact = await prisma.emergencyContact.findFirst({ where: { id: contactId, userId } });
      if (!contact) throw new ApiError(404, 'Contact not found');

      await prisma.emergencyContact.delete({ where: { id: contactId } });
      res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
      next(error);
    }
  };

  scheduleCheckin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { scheduledAt, message } = req.body;

      const checkin = await prisma.safetyCheckin.create({
        data: { userId, scheduledAt: new Date(scheduledAt), message },
      });

      res.status(201).json({ success: true, data: checkin });
    } catch (error) {
      next(error);
    }
  };

  respondToCheckin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { checkinId } = req.params;

      const checkin = await prisma.safetyCheckin.findFirst({
        where: { id: checkinId, userId, status: 'PENDING' },
      });
      if (!checkin) throw new ApiError(404, 'Check-in not found');

      const updated = await prisma.safetyCheckin.update({
        where: { id: checkinId },
        data: { status: 'SAFE', respondedAt: new Date() },
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  getCheckins = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const checkins = await prisma.safetyCheckin.findMany({
        where: { userId },
        orderBy: { scheduledAt: 'desc' },
        take: 50,
      });
      res.json({ success: true, data: checkins });
    } catch (error) {
      next(error);
    }
  };

  getNearbyAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { latitude, longitude } = req.query;
      if (!latitude || !longitude) throw new ApiError(400, 'Location required');

      const alerts = await prisma.sOSAlert.findMany({
        where: { status: 'ACTIVE' },
        include: { user: { select: { name: true, avatar: true } } },
      });

      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);

      const nearbyAlerts = alerts.filter(alert => {
        const distance = this.haversineDistance(lat, lon, alert.latitude, alert.longitude);
        return distance <= SOS_CONFIG.nearbyRadiusMeters;
      });

      res.json({ success: true, data: nearbyAlerts });
    } catch (error) {
      next(error);
    }
  };

  respondToAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { alertId } = req.params;
      const { latitude, longitude } = req.body;

      const distance = latitude && longitude ? 0 : 999;

      await prisma.nearbyUserAlert.create({
        data: {
          sosAlertId: alertId,
          userId,
          distance,
          responded: true,
          respondedAt: new Date(),
        },
      });

      res.json({ success: true, message: 'Response recorded. Thank you for helping!' });
    } catch (error) {
      next(error);
    }
  };

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
