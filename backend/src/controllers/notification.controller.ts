import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';

export class NotificationController {
  getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 30;

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.notification.count({ where: { userId } }),
        prisma.notification.count({ where: { userId, isRead: false } }),
      ]);

      res.json({
        success: true,
        data: { notifications, total, unreadCount, page, pages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { notificationId } = req.params;

      await prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
      });

      res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      res.json({ success: true, message: 'All marked as read' });
    } catch (error) {
      next(error);
    }
  };

  deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { notificationId } = req.params;

      await prisma.notification.deleteMany({
        where: { id: notificationId, userId },
      });

      res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      next(error);
    }
  };
}
