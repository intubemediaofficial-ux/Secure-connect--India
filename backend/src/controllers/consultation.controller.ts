import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';
import { CONSULTATION_CONFIG, PAGINATION } from '../config/constants';
import { PaymentService } from '../services/payment.service';
import { NotificationService } from '../services/notification.service';

export class ConsultationController {
  private paymentService = new PaymentService();
  private notificationService = new NotificationService();

  listExperts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, language, online, search, sort } = req.query;
      const page = parseInt(req.query.page as string) || PAGINATION.defaultPage;
      const limit = parseInt(req.query.limit as string) || PAGINATION.defaultLimit;

      const where: any = { isVerified: true, isActive: true };

      if (category) where.category = category;
      if (language) where.languages = { has: language as string };
      if (online === 'true') where.isOnline = true;
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { specialization: { has: search as string } },
        ];
      }

      const orderBy: any = sort === 'rating' ? { rating: 'desc' }
        : sort === 'price_low' ? { perMinuteRate: 'asc' }
        : sort === 'price_high' ? { perMinuteRate: 'desc' }
        : sort === 'experience' ? { experience: 'desc' }
        : { rating: 'desc' };

      const [experts, total] = await Promise.all([
        prisma.expert.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            qualification: true,
            specialization: true,
            experience: true,
            category: true,
            isOnline: true,
            rating: true,
            totalRatings: true,
            totalConsultations: true,
            perMinuteRate: true,
            languages: true,
          },
        }),
        prisma.expert.count({ where }),
      ]);

      res.json({ success: true, data: { experts, total, page, pages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  };

  getExpertProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { expertId } = req.params;

      const expert = await prisma.expert.findUnique({
        where: { id: expertId },
        include: {
          availability: { where: { isActive: true } },
          ratings: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, avatar: true } } },
          },
        },
      });

      if (!expert) throw new ApiError(404, 'Expert not found');

      res.json({ success: true, data: expert });
    } catch (error) {
      next(error);
    }
  };

  getExpertsByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.params;

      const experts = await prisma.expert.findMany({
        where: { category: category as any, isVerified: true, isActive: true },
        orderBy: [{ isOnline: 'desc' }, { rating: 'desc' }],
        select: {
          id: true, name: true, avatar: true, bio: true, qualification: true,
          specialization: true, experience: true, isOnline: true, rating: true,
          totalConsultations: true, perMinuteRate: true, languages: true,
        },
      });

      res.json({ success: true, data: experts });
    } catch (error) {
      next(error);
    }
  };

  requestConsultation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { expertId, category, mode, isAnonymous, userNote } = req.body;

      const expert = await prisma.expert.findUnique({ where: { id: expertId } });
      if (!expert) throw new ApiError(404, 'Expert not found');
      if (!expert.isOnline) throw new ApiError(400, 'Expert is currently offline');

      // Check wallet balance
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < expert.perMinuteRate * 5) {
        throw new ApiError(402, 'Insufficient balance. Please recharge your wallet (minimum 5 minutes worth).');
      }

      const consultation = await prisma.consultation.create({
        data: {
          userId,
          expertId,
          category: category || expert.category,
          mode: mode || 'CHAT',
          perMinuteRate: expert.perMinuteRate,
          isAnonymous: isAnonymous || false,
          userNote,
          payment: {
            create: { amount: 0, status: 'PENDING' },
          },
        },
        include: { expert: { select: { name: true, perMinuteRate: true } } },
      });

      // Notify expert
      const user = await prisma.user.findUnique({ where: { id: userId } });
      await this.notificationService.sendConsultationNotification(expertId, {
        userName: isAnonymous ? 'Anonymous User' : (user?.name || 'User'),
        category: category || expert.category,
        mode: mode || 'CHAT',
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`expert:${expertId}`).emit('consultation:request', consultation);
      }

      res.status(201).json({ success: true, data: consultation });
    } catch (error) {
      next(error);
    }
  };

  acceptConsultation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;
      const { consultationId } = req.params;

      const consultation = await prisma.consultation.findFirst({
        where: { id: consultationId, expertId, status: 'PENDING' },
      });

      if (!consultation) throw new ApiError(404, 'Consultation not found');

      const updated = await prisma.consultation.update({
        where: { id: consultationId },
        data: { status: 'ACCEPTED' },
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${consultation.userId}`).emit('consultation:accepted', updated);
      }

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  rejectConsultation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;
      const { consultationId } = req.params;

      const consultation = await prisma.consultation.findFirst({
        where: { id: consultationId, expertId, status: 'PENDING' },
      });

      if (!consultation) throw new ApiError(404, 'Consultation not found');

      const updated = await prisma.consultation.update({
        where: { id: consultationId },
        data: { status: 'REJECTED' },
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${consultation.userId}`).emit('consultation:rejected', updated);
      }

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  startConsultation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { consultationId } = req.params;

      const consultation = await prisma.consultation.findFirst({
        where: { id: consultationId, status: 'ACCEPTED' },
      });

      if (!consultation) throw new ApiError(404, 'Consultation not found or not accepted');

      const updated = await prisma.consultation.update({
        where: { id: consultationId },
        data: { status: 'ACTIVE', startTime: new Date() },
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`consultation:${consultationId}`).emit('consultation:started', updated);
      }

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  endConsultation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { consultationId } = req.params;

      const consultation = await prisma.consultation.findFirst({
        where: { id: consultationId, status: 'ACTIVE' },
      });

      if (!consultation) throw new ApiError(404, 'Active consultation not found');

      const endTime = new Date();
      const duration = Math.ceil((endTime.getTime() - consultation.startTime!.getTime()) / 1000);
      const durationMinutes = Math.ceil(duration / 60);
      const totalAmount = durationMinutes * consultation.perMinuteRate;

      // Deduct from user wallet
      await this.paymentService.deductConsultationFee(consultation.userId, totalAmount, consultationId);

      // Credit expert
      await this.paymentService.creditExpertEarning(consultation.expertId, totalAmount, consultationId);

      const updated = await prisma.consultation.update({
        where: { id: consultationId },
        data: { status: 'COMPLETED', endTime, duration, totalAmount },
      });

      // Update expert stats
      await prisma.expert.update({
        where: { id: consultation.expertId },
        data: { totalConsultations: { increment: 1 } },
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`consultation:${consultationId}`).emit('consultation:ended', {
          ...updated,
          durationMinutes,
          totalAmount,
        });
      }

      res.json({
        success: true,
        data: { ...updated, durationMinutes, totalAmount },
      });
    } catch (error) {
      next(error);
    }
  };

  getActiveConsultation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.user!.id;
      const type = req.user!.type;

      const where = type === 'expert'
        ? { expertId: id, status: { in: ['PENDING', 'ACCEPTED', 'ACTIVE'] as any } }
        : { userId: id, status: { in: ['PENDING', 'ACCEPTED', 'ACTIVE'] as any } };

      const consultation = await prisma.consultation.findFirst({
        where,
        include: {
          expert: { select: { id: true, name: true, avatar: true, perMinuteRate: true } },
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, data: consultation });
    } catch (error) {
      next(error);
    }
  };

  getConsultationHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.user!.id;
      const type = req.user!.type;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const where = type === 'expert' ? { expertId: id } : { userId: id };

      const [consultations, total] = await Promise.all([
        prisma.consultation.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            expert: { select: { id: true, name: true, avatar: true, perMinuteRate: true } },
            user: { select: { id: true, name: true, avatar: true } },
            rating: true,
          },
        }),
        prisma.consultation.count({ where }),
      ]);

      res.json({ success: true, data: { consultations, total, page, pages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  };

  getConsultationDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { consultationId } = req.params;

      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
        include: {
          expert: { select: { id: true, name: true, avatar: true, qualification: true, perMinuteRate: true } },
          user: { select: { id: true, name: true, avatar: true } },
          messages: { orderBy: { createdAt: 'asc' } },
          rating: true,
          payment: true,
        },
      });

      if (!consultation) throw new ApiError(404, 'Consultation not found');
      res.json({ success: true, data: consultation });
    } catch (error) {
      next(error);
    }
  };

  rateConsultation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { consultationId } = req.params;
      const { rating, review, isAnonymous } = req.body;

      if (!rating || rating < 1 || rating > 5) throw new ApiError(400, 'Rating must be 1-5');

      const consultation = await prisma.consultation.findFirst({
        where: { id: consultationId, userId, status: 'COMPLETED' },
      });

      if (!consultation) throw new ApiError(404, 'Completed consultation not found');

      const existingRating = await prisma.rating.findUnique({ where: { consultationId } });
      if (existingRating) throw new ApiError(409, 'Already rated');

      const newRating = await prisma.rating.create({
        data: {
          userId,
          expertId: consultation.expertId,
          consultationId,
          rating,
          review,
          isAnonymous: isAnonymous || false,
        },
      });

      // Update expert average rating
      const allRatings = await prisma.rating.aggregate({
        where: { expertId: consultation.expertId },
        _avg: { rating: true },
        _count: true,
      });

      await prisma.expert.update({
        where: { id: consultation.expertId },
        data: {
          rating: allRatings._avg.rating || 0,
          totalRatings: allRatings._count,
        },
      });

      res.status(201).json({ success: true, data: newRating });
    } catch (error) {
      next(error);
    }
  };

  addFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { expertId } = req.params;

      const fav = await prisma.favoriteExpert.create({
        data: { userId, expertId },
      });

      res.status(201).json({ success: true, data: fav });
    } catch (error) {
      next(error);
    }
  };

  removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { expertId } = req.params;

      await prisma.favoriteExpert.deleteMany({ where: { userId, expertId } });
      res.json({ success: true, message: 'Removed from favorites' });
    } catch (error) {
      next(error);
    }
  };

  getFavorites = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const favorites = await prisma.favoriteExpert.findMany({
        where: { userId },
        include: {
          expert: {
            select: {
              id: true, name: true, avatar: true, qualification: true,
              specialization: true, isOnline: true, rating: true, perMinuteRate: true,
            },
          },
        },
      });

      res.json({ success: true, data: favorites });
    } catch (error) {
      next(error);
    }
  };
}
