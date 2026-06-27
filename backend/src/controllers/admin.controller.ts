import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';

export class AdminController {
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) throw new ApiError(401, 'Invalid credentials');

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) throw new ApiError(401, 'Invalid credentials');

      const token = jwt.sign(
        { id: admin.id, role: admin.role, type: 'admin' },
        process.env.JWT_SECRET || 'secureconnect-secret-key',
        { expiresIn: '24h' }
      );

      res.json({ success: true, data: { admin: { ...admin, password: undefined }, token } });
    } catch (error) {
      next(error);
    }
  };

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [totalUsers, totalExperts, activeAlerts, todayConsultations, revenue] = await Promise.all([
        prisma.user.count(),
        prisma.expert.count(),
        prisma.sOSAlert.count({ where: { status: 'ACTIVE' } }),
        prisma.consultation.count({
          where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        }),
        prisma.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
      ]);

      const recentAlerts = await prisma.sOSAlert.findMany({
        where: { status: 'ACTIVE' },
        include: { user: { select: { name: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      res.json({
        success: true,
        data: {
          stats: {
            totalUsers,
            totalExperts,
            activeAlerts,
            todayConsultations,
            totalRevenue: revenue._sum.amount || 0,
          },
          recentAlerts,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: { wallet: { select: { balance: true } } },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({ success: true, data: { users, total, page, pages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  };

  updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
      res.json({ success: true, message: 'User deactivated' });
    } catch (error) {
      next(error);
    }
  };

  getExperts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const verified = req.query.verified;

      const where: any = {};
      if (verified === 'true') where.isVerified = true;
      if (verified === 'false') where.isVerified = false;

      const [experts, total] = await Promise.all([
        prisma.expert.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: { wallet: true },
        }),
        prisma.expert.count({ where }),
      ]);

      res.json({ success: true, data: { experts, total, page, pages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  };

  verifyExpert = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { expertId } = req.params;
      const { isVerified } = req.body;

      const expert = await prisma.expert.update({
        where: { id: expertId },
        data: { isVerified },
      });

      res.json({ success: true, data: expert });
    } catch (error) {
      next(error);
    }
  };

  updateExpertStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { expertId } = req.params;
      const { isActive } = req.body;

      const expert = await prisma.expert.update({
        where: { id: expertId },
        data: { isActive },
      });

      res.json({ success: true, data: expert });
    } catch (error) {
      next(error);
    }
  };

  getSOSAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      const where: any = {};
      if (status) where.status = status;

      const [alerts, total] = await Promise.all([
        prisma.sOSAlert.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: { select: { name: true, phone: true } },
            alertedContacts: true,
          },
        }),
        prisma.sOSAlert.count({ where }),
      ]);

      res.json({ success: true, data: { alerts, total, page, pages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  };

  escalateAlert = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { alertId } = req.params;

      const alert = await prisma.sOSAlert.update({
        where: { id: alertId },
        data: { status: 'ESCALATED', escalatedAt: new Date() },
      });

      res.json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  };

  getConsultations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const [consultations, total] = await Promise.all([
        prisma.consultation.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            user: { select: { name: true } },
            expert: { select: { name: true } },
          },
        }),
        prisma.consultation.count(),
      ]);

      res.json({ success: true, data: { consultations, total, page, pages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  };

  getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          include: { wallet: { include: { user: { select: { name: true, phone: true } } } } },
        }),
        prisma.transaction.count(),
      ]);

      res.json({ success: true, data: { transactions, total, page, pages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  };

  getRevenue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const totalRevenue = await prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true, platformFee: true },
      });

      const monthlyRevenue = await prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        _sum: { amount: true, platformFee: true },
      });

      res.json({
        success: true,
        data: {
          total: { revenue: totalRevenue._sum.amount || 0, platformFee: totalRevenue._sum.platformFee || 0 },
          monthly: { revenue: monthlyRevenue._sum.amount || 0, platformFee: monthlyRevenue._sum.platformFee || 0 },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await prisma.appSetting.findMany();
      res.json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key, value } = req.body;

      const setting = await prisma.appSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });

      res.json({ success: true, data: setting });
    } catch (error) {
      next(error);
    }
  };
}
