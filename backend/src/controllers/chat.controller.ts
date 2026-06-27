import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';

export class ChatController {
  getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { consultationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const messages = await prisma.chatMessage.findMany({
        where: { consultationId, isDeleted: false },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await prisma.chatMessage.count({
        where: { consultationId, isDeleted: false },
      });

      res.json({
        success: true,
        data: { messages: messages.reverse(), total, page, pages: Math.ceil(total / limit) },
      });
    } catch (error) {
      next(error);
    }
  };

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const senderId = req.user!.id;
      const senderType = req.user!.type === 'expert' ? 'EXPERT' : 'USER';
      const { consultationId, content, messageType, mediaUrl } = req.body;

      if (!consultationId || !content) {
        throw new ApiError(400, 'Consultation ID and content required');
      }

      const consultation = await prisma.consultation.findFirst({
        where: { id: consultationId, status: { in: ['ACCEPTED', 'ACTIVE'] } },
      });

      if (!consultation) throw new ApiError(404, 'Active consultation not found');

      const message = await prisma.chatMessage.create({
        data: {
          consultationId,
          senderId,
          senderType: senderType as any,
          content,
          messageType: messageType || 'TEXT',
          mediaUrl,
        },
      });

      // Emit via Socket.IO
      const io = req.app.get('io');
      if (io) {
        io.to(`consultation:${consultationId}`).emit('chat:message', message);
      }

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const readerId = req.user!.id;
      const { consultationId } = req.params;

      await prisma.chatMessage.updateMany({
        where: {
          consultationId,
          senderId: { not: readerId },
          isRead: false,
        },
        data: { isRead: true },
      });

      res.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
      next(error);
    }
  };

  uploadMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In production: multer + S3 upload
      res.json({ success: true, data: { url: '' } });
    } catch (error) {
      next(error);
    }
  };
}
