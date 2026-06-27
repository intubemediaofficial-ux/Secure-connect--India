import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';

export class UserController {
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          wallet: true,
          emergencyContacts: true,
          _count: { select: { consultations: true, sosAlerts: true } },
        },
      });

      if (!user) throw new ApiError(404, 'User not found');
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { name, email, gender, dateOfBirth, language } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(gender && { gender }),
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(language && { language }),
        },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      // In production: multer + S3
      res.json({ success: true, data: { avatarUrl: '' } });
    } catch (error) {
      next(error);
    }
  };

  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { language: true, anonymousId: true },
      });
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { language } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { ...(language && { language }) },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  getTrustedLocations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const locations = await prisma.trustedLocation.findMany({ where: { userId } });
      res.json({ success: true, data: locations });
    } catch (error) {
      next(error);
    }
  };

  addTrustedLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { name, latitude, longitude, radius, type } = req.body;

      if (!name || !latitude || !longitude) {
        throw new ApiError(400, 'Name and coordinates required');
      }

      const location = await prisma.trustedLocation.create({
        data: { userId, name, latitude, longitude, radius: radius || 500, type: type || 'home' },
      });

      res.status(201).json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  };

  removeTrustedLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { locationId } = req.params;

      const location = await prisma.trustedLocation.findFirst({ where: { id: locationId, userId } });
      if (!location) throw new ApiError(404, 'Location not found');

      await prisma.trustedLocation.delete({ where: { id: locationId } });
      res.json({ success: true, message: 'Location removed' });
    } catch (error) {
      next(error);
    }
  };
}
