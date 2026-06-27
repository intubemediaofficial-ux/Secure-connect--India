import prisma from '../config/database';
import { OTPService } from './otp.service';
import { EmailService } from './email.service';

interface SOSAlertData {
  userName: string;
  latitude: number;
  longitude: number;
  alertId: string;
  address?: string;
}

export class NotificationService {
  private otpService = new OTPService();
  private emailService = new EmailService();

  async sendSOSAlert(phone: string, data: SOSAlertData): Promise<void> {
    const mapUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
    const message = `EMERGENCY SOS! ${data.userName} needs help! Location: ${mapUrl}. Open SecureConnect app for live tracking.`;

    await this.otpService.sendSOSAlert(phone, message);
  }

  async createNotification(userId: string, notification: {
    title: string;
    body: string;
    type: string;
    data?: Record<string, unknown>;
  }): Promise<void> {
    await prisma.notification.create({
      data: {
        userId,
        title: notification.title,
        body: notification.body,
        type: notification.type as any,
        data: notification.data ? JSON.parse(JSON.stringify(notification.data)) : undefined,
      },
    });

    // Send push notification via Firebase
    await this.sendPushNotification(userId, notification);
  }

  async sendPushNotification(userId: string, notification: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<void> {
    try {
      // Firebase push notification implementation
      if (process.env.FIREBASE_PROJECT_ID) {
        // In production, use firebase-admin
        console.log(`[PUSH] User: ${userId}, Title: ${notification.title}`);
      }
    } catch (error) {
      console.error('Push notification failed:', error);
    }
  }

  async sendConsultationNotification(expertId: string, data: {
    userName: string;
    category: string;
    mode: string;
  }): Promise<void> {
    await this.createNotification(expertId, {
      title: 'New Consultation Request',
      body: `${data.userName} wants to connect for ${data.category} via ${data.mode}`,
      type: 'CONSULTATION_REQUEST',
      data: data as any,
    });
  }

  async sendWalletNotification(userId: string, data: {
    amount: number;
    type: string;
    balance: number;
  }): Promise<void> {
    const title = data.type === 'RECHARGE' ? 'Wallet Recharged' : 'Wallet Debited';
    const body = data.type === 'RECHARGE'
      ? `₹${data.amount} added to wallet. Balance: ₹${data.balance}`
      : `₹${data.amount} deducted. Balance: ₹${data.balance}`;

    await this.createNotification(userId, {
      title,
      body,
      type: 'WALLET_RECHARGE',
      data: data as any,
    });
  }

  async sendSafetyCheckinReminder(userId: string): Promise<void> {
    await this.createNotification(userId, {
      title: 'Safety Check-in',
      body: 'Are you safe? Please respond to your safety check-in.',
      type: 'SAFETY_CHECKIN',
    });
  }

  async sendMissedCheckinAlert(userId: string, contacts: { phone: string; name: string }[]): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    for (const contact of contacts) {
      const message = `SAFETY ALERT: ${user.name || 'A user'} missed their safety check-in on SecureConnect. Please verify they are safe.`;
      await this.otpService.sendSOSAlert(contact.phone, message);
    }
  }
}
