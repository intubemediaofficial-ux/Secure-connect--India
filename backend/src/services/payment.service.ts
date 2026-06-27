import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../config/database';
import { WALLET_CONFIG, CONSULTATION_CONFIG } from '../config/constants';
import { ApiError } from '../middleware/error.middleware';

export class PaymentService {
  private razorpay: Razorpay | null = null;

  constructor() {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    }
  }

  async createRechargeOrder(userId: string, amount: number) {
    if (!WALLET_CONFIG.rechargeOptions.includes(amount)) {
      throw new ApiError(400, 'Invalid recharge amount');
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new ApiError(404, 'Wallet not found');
    if (!this.razorpay) throw new ApiError(503, 'Payment gateway not configured');

    const order = await this.razorpay.orders.create({
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: `wallet_${userId}_${Date.now()}`,
      notes: {
        userId,
        walletId: wallet.id,
        type: 'RECHARGE',
      },
    });

    // Create pending transaction
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: 'RECHARGE',
        status: 'PENDING',
        description: `Wallet recharge of ₹${amount}`,
        referenceId: order.id,
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  async verifyRechargePayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    userId: string;
  }) {
    // Verify signature
    const body = data.razorpayOrderId + '|' + data.razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== data.razorpaySignature) {
      throw new ApiError(400, 'Invalid payment signature');
    }

    // Update transaction
    const transaction = await prisma.transaction.findFirst({
      where: { referenceId: data.razorpayOrderId },
    });

    if (!transaction) throw new ApiError(404, 'Transaction not found');

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'COMPLETED' },
    });

    // Update wallet balance
    const wallet = await prisma.wallet.update({
      where: { id: transaction.walletId },
      data: { balance: { increment: transaction.amount } },
    });

    return { balance: wallet.balance, amount: transaction.amount };
  }

  async deductConsultationFee(userId: string, amount: number, consultationId: string) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new ApiError(404, 'Wallet not found');

    if (wallet.balance < amount) {
      throw new ApiError(402, 'Insufficient wallet balance');
    }

    // Deduct from user wallet
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    });

    // Create debit transaction
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount: -amount,
        type: 'CONSULTATION_DEBIT',
        status: 'COMPLETED',
        description: `Consultation charge`,
        referenceId: consultationId,
      },
    });

    return wallet.balance - amount;
  }

  async creditExpertEarning(expertId: string, totalAmount: number, consultationId: string) {
    const platformFee = (totalAmount * CONSULTATION_CONFIG.platformFeePercent) / 100;
    const expertAmount = totalAmount - platformFee;

    const expertWallet = await prisma.expertWallet.findUnique({ where: { expertId } });
    if (!expertWallet) return;

    // Credit expert wallet
    await prisma.expertWallet.update({
      where: { id: expertWallet.id },
      data: {
        balance: { increment: expertAmount },
        totalEarnings: { increment: expertAmount },
      },
    });

    // Create earning record
    await prisma.earning.create({
      data: {
        expertId,
        amount: expertAmount,
        type: 'consultation',
        status: 'pending',
        metadata: {
          consultationId,
          totalAmount,
          platformFee,
          expertAmount,
        },
      },
    });

    // Update payment record
    await prisma.payment.update({
      where: { consultationId },
      data: {
        amount: totalAmount,
        platformFee,
        expertAmount,
        status: 'COMPLETED',
      },
    });
  }

  async processWithdrawal(expertId: string, amount: number) {
    const expertWallet = await prisma.expertWallet.findUnique({ where: { expertId } });
    if (!expertWallet) throw new ApiError(404, 'Expert wallet not found');

    if (expertWallet.balance < amount) {
      throw new ApiError(402, 'Insufficient balance');
    }

    // In production, initiate bank transfer via Razorpay
    await prisma.expertWallet.update({
      where: { id: expertWallet.id },
      data: {
        balance: { decrement: amount },
        pendingPayout: { increment: amount },
      },
    });

    await prisma.earning.create({
      data: {
        expertId,
        amount: -amount,
        type: 'withdrawal',
        status: 'pending',
      },
    });

    return { remainingBalance: expertWallet.balance - amount };
  }
}
