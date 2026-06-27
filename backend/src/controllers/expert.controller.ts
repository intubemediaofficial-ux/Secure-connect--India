import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';

export class ExpertController {
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;

      const expert = await prisma.expert.findUnique({
        where: { id: expertId },
        include: { wallet: true, availability: true },
      });

      if (!expert) throw new ApiError(404, 'Expert not found');
      res.json({ success: true, data: expert });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;
      const { name, bio, specialization, languages, perMinuteRate, bankAccount, ifscCode, upiId } = req.body;

      const expert = await prisma.expert.update({
        where: { id: expertId },
        data: {
          ...(name && { name }),
          ...(bio && { bio }),
          ...(specialization && { specialization }),
          ...(languages && { languages }),
          ...(perMinuteRate && { perMinuteRate: parseFloat(perMinuteRate) }),
          ...(bankAccount && { bankAccount }),
          ...(ifscCode && { ifscCode }),
          ...(upiId && { upiId }),
        },
      });

      res.json({ success: true, data: expert });
    } catch (error) {
      next(error);
    }
  };

  getAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;
      const availability = await prisma.expertAvailability.findMany({
        where: { expertId },
        orderBy: { dayOfWeek: 'asc' },
      });
      res.json({ success: true, data: availability });
    } catch (error) {
      next(error);
    }
  };

  updateAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;
      const { availability } = req.body; // Array of { dayOfWeek, startTime, endTime, isActive }

      // Delete existing and recreate
      await prisma.expertAvailability.deleteMany({ where: { expertId } });

      if (availability && availability.length > 0) {
        await prisma.expertAvailability.createMany({
          data: availability.map((a: any) => ({
            expertId,
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
            isActive: a.isActive !== false,
          })),
        });
      }

      const updated = await prisma.expertAvailability.findMany({
        where: { expertId },
        orderBy: { dayOfWeek: 'asc' },
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  goOnline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;
      await prisma.expert.update({ where: { id: expertId }, data: { isOnline: true } });

      const io = req.app.get('io');
      if (io) io.emit('expert:online', { expertId });

      res.json({ success: true, message: 'You are now online' });
    } catch (error) {
      next(error);
    }
  };

  goOffline = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;
      await prisma.expert.update({ where: { id: expertId }, data: { isOnline: false } });

      const io = req.app.get('io');
      if (io) io.emit('expert:offline', { expertId });

      res.json({ success: true, message: 'You are now offline' });
    } catch (error) {
      next(error);
    }
  };

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;

      const [expert, todayConsultations, wallet, pendingRequests] = await Promise.all([
        prisma.expert.findUnique({ where: { id: expertId } }),
        prisma.consultation.count({
          where: {
            expertId,
            status: 'COMPLETED',
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
        prisma.expertWallet.findUnique({ where: { expertId } }),
        prisma.consultation.count({
          where: { expertId, status: 'PENDING' },
        }),
      ]);

      res.json({
        success: true,
        data: {
          expert,
          stats: {
            todayConsultations,
            pendingRequests,
            balance: wallet?.balance || 0,
            totalEarnings: wallet?.totalEarnings || 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getConsultations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;
      const status = req.query.status as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const where: any = { expertId };
      if (status) where.status = status;

      const [consultations, total] = await Promise.all([
        prisma.consultation.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: { user: { select: { id: true, name: true, avatar: true } } },
        }),
        prisma.consultation.count({ where }),
      ]);

      res.json({ success: true, data: { consultations, total, page, pages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  };

  getRatings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const [ratings, total] = await Promise.all([
        prisma.rating.findMany({
          where: { expertId },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: { user: { select: { name: true, avatar: true } } },
        }),
        prisma.rating.count({ where: { expertId } }),
      ]);

      res.json({ success: true, data: { ratings, total, page, pages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  };
}
