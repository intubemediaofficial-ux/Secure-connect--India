import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';
import { PaymentService } from '../services/payment.service';
import { NotificationService } from '../services/notification.service';

export class WalletController {
  private paymentService = new PaymentService();
  private notificationService = new NotificationService();

  getBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new ApiError(404, 'Wallet not found');

      res.json({ success: true, data: { balance: wallet.balance, currency: wallet.currency } });
    } catch (error) {
      next(error);
    }
  };

  getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as string;

      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new ApiError(404, 'Wallet not found');

      const where: any = { walletId: wallet.id };
      if (type) where.type = type;

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.transaction.count({ where }),
      ]);

      res.json({ success: true, data: { transactions, total, page, pages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  };

  createRechargeOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { amount } = req.body;

      if (!amount) throw new ApiError(400, 'Amount required');

      const order = await this.paymentService.createRechargeOrder(userId, parseInt(amount));

      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  };

  verifyRecharge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      const result = await this.paymentService.verifyRechargePayment({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        userId,
      });

      await this.notificationService.sendWalletNotification(userId, {
        amount: result.amount,
        type: 'RECHARGE',
        balance: result.balance,
      });

      res.json({ success: true, message: 'Recharge successful', data: result });
    } catch (error) {
      next(error);
    }
  };

  getExpertBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;

      const wallet = await prisma.expertWallet.findUnique({ where: { expertId } });
      if (!wallet) throw new ApiError(404, 'Expert wallet not found');

      res.json({
        success: true,
        data: {
          balance: wallet.balance,
          totalEarnings: wallet.totalEarnings,
          pendingPayout: wallet.pendingPayout,
          currency: wallet.currency,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getExpertEarnings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const [earnings, total] = await Promise.all([
        prisma.earning.findMany({
          where: { expertId },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.earning.count({ where: { expertId } }),
      ]);

      res.json({ success: true, data: { earnings, total, page, pages: Math.ceil(total / limit) } });
    } catch (error) {
      next(error);
    }
  };

  requestWithdrawal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expertId = req.user!.id;
      const { amount } = req.body;

      if (!amount || amount < 500) {
        throw new ApiError(400, 'Minimum withdrawal amount is ₹500');
      }

      const result = await this.paymentService.processWithdrawal(expertId, parseFloat(amount));

      res.json({ success: true, message: 'Withdrawal request submitted', data: result });
    } catch (error) {
      next(error);
    }
  };
}
