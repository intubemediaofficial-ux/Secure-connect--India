import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { ApiError } from '../middleware/error.middleware';
import { OTP_CONFIG } from '../config/constants';
import { OTPService } from '../services/otp.service';
import { EmailService } from '../services/email.service';

export class AuthController {
  private otpService = new OTPService();
  private emailService = new EmailService();

  sendOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone } = req.body;

      if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
        throw new ApiError(400, 'Valid Indian phone number required (10 digits starting with 6-9)');
      }

      const otp = this.otpService.generateOTP();
      const expiresAt = new Date(Date.now() + OTP_CONFIG.expiryMinutes * 60 * 1000);

      await prisma.oTPCode.create({
        data: { phone, code: otp, type: 'LOGIN', expiresAt },
      });

      await this.otpService.sendSMS(phone, otp);

      res.json({
        success: true,
        message: 'OTP sent successfully',
        expiresIn: OTP_CONFIG.expiryMinutes * 60,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        throw new ApiError(400, 'Phone and OTP required');
      }

      const otpRecord = await prisma.oTPCode.findFirst({
        where: {
          phone,
          code: otp,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) {
        throw new ApiError(400, 'Invalid or expired OTP');
      }

      await prisma.oTPCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      let user = await prisma.user.findUnique({ where: { phone } });
      const isNewUser = !user;

      if (!user) {
        user = await prisma.user.create({
          data: {
            phone,
            isVerified: true,
            wallet: { create: { balance: 0 } },
          },
        });
      }

      const accessToken = this.generateAccessToken(user.id, user.role, 'user');
      const refreshToken = this.generateRefreshToken(user.id);

      await prisma.userSession.create({
        data: {
          userId: user.id,
          token: refreshToken,
          deviceInfo: req.headers['user-agent'] || null,
          ipAddress: req.ip || null,
          platform: req.body.platform || null,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            gender: user.gender,
            isVerified: user.isVerified,
            role: user.role,
            language: user.language,
          },
          accessToken,
          refreshToken,
          isNewUser,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  resendOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone } = req.body;

      if (!phone) throw new ApiError(400, 'Phone number required');

      const lastOtp = await prisma.oTPCode.findFirst({
        where: { phone },
        orderBy: { createdAt: 'desc' },
      });

      if (lastOtp) {
        const timeSince = Date.now() - lastOtp.createdAt.getTime();
        if (timeSince < OTP_CONFIG.resendCooldownSeconds * 1000) {
          const remaining = Math.ceil((OTP_CONFIG.resendCooldownSeconds * 1000 - timeSince) / 1000);
          throw new ApiError(429, `Please wait ${remaining} seconds before resending`);
        }
      }

      const otp = this.otpService.generateOTP();
      const expiresAt = new Date(Date.now() + OTP_CONFIG.expiryMinutes * 60 * 1000);

      await prisma.oTPCode.create({
        data: { phone, code: otp, type: 'LOGIN', expiresAt },
      });

      await this.otpService.sendSMS(phone, otp);

      res.json({ success: true, message: 'OTP resent successfully' });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, code } = req.body;
      const userId = req.user!.id;

      const otpRecord = await prisma.oTPCode.findFirst({
        where: {
          phone: email,
          code,
          type: 'VERIFICATION',
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) throw new ApiError(400, 'Invalid or expired verification code');

      await prisma.oTPCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { email },
      });

      res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  };

  sendEmailVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const userId = req.user!.id;

      const code = this.otpService.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.oTPCode.create({
        data: { userId, phone: email, code, type: 'VERIFICATION', expiresAt },
      });

      await this.emailService.sendVerificationEmail(email, code);

      res.json({ success: true, message: 'Verification email sent' });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new ApiError(400, 'Refresh token required');

      const session = await prisma.userSession.findUnique({
        where: { token: refreshToken, isActive: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new ApiError(401, 'Invalid or expired refresh token');
      }

      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user) throw new ApiError(404, 'User not found');

      const accessToken = this.generateAccessToken(user.id, user.role, 'user');

      await prisma.userSession.update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() },
      });

      res.json({ success: true, data: { accessToken } });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await prisma.userSession.updateMany({
          where: { token: refreshToken },
          data: { isActive: false },
        });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, type } = req.user!;

      if (type === 'expert') {
        const expert = await prisma.expert.findUnique({
          where: { id },
          include: { wallet: true },
        });
        return res.json({ success: true, data: expert });
      }

      if (type === 'admin') {
        const admin = await prisma.admin.findUnique({ where: { id } });
        return res.json({ success: true, data: admin });
      }

      const user = await prisma.user.findUnique({
        where: { id },
        include: { wallet: true, emergencyContacts: true },
      });

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  sendEmailOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ApiError(400, 'Valid email address required');
      }

      const otp = this.otpService.generateOTP();
      const expiresAt = new Date(Date.now() + OTP_CONFIG.expiryMinutes * 60 * 1000);

      await prisma.oTPCode.create({
        data: { phone: email, code: otp, type: 'LOGIN', expiresAt },
      });

      await this.emailService.sendVerificationEmail(email, otp);

      res.json({
        success: true,
        message: 'OTP sent to your email',
        expiresIn: OTP_CONFIG.expiryMinutes * 60,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmailOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        throw new ApiError(400, 'Email and OTP required');
      }

      const otpRecord = await prisma.oTPCode.findFirst({
        where: {
          phone: email,
          code: otp,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) {
        throw new ApiError(400, 'Invalid or expired OTP');
      }

      await prisma.oTPCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      let user = await prisma.user.findFirst({ where: { email } });
      const isNewUser = !user;

      if (!user) {
        user = await prisma.user.create({
          data: {
            phone: `email_${Date.now()}`,
            email,
            isVerified: true,
            wallet: { create: { balance: 0 } },
          },
        });
      }

      const accessToken = this.generateAccessToken(user.id, user.role, 'user');
      const refreshToken = this.generateRefreshToken(user.id);

      await prisma.userSession.create({
        data: {
          userId: user.id,
          token: refreshToken,
          deviceInfo: req.headers['user-agent'] || null,
          ipAddress: req.ip || null,
          platform: req.body.platform || null,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            gender: user.gender,
            isVerified: user.isVerified,
            role: user.role,
            language: user.language,
          },
          accessToken,
          refreshToken,
          isNewUser,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  registerExpert = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, phone, qualification, specialization, experience, category, perMinuteRate, languages, gender, bio } = req.body;

      const existing = await prisma.expert.findFirst({
        where: { OR: [{ email }, { phone }] },
      });

      if (existing) throw new ApiError(409, 'Expert with this email or phone already exists');

      const expert = await prisma.expert.create({
        data: {
          name,
          email,
          phone,
          qualification,
          specialization: specialization || [],
          experience: parseInt(experience),
          category,
          perMinuteRate: parseFloat(perMinuteRate),
          languages: languages || ['hi', 'en'],
          gender: gender || 'OTHER',
          bio,
          documents: [],
          wallet: { create: {} },
        },
      });

      const accessToken = this.generateAccessToken(expert.id, 'expert', 'expert');

      res.status(201).json({
        success: true,
        message: 'Registration successful. Pending admin verification.',
        data: { expert, accessToken },
      });
    } catch (error) {
      next(error);
    }
  };

  expertLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, otp } = req.body;

      const otpRecord = await prisma.oTPCode.findFirst({
        where: {
          phone,
          code: otp,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) throw new ApiError(400, 'Invalid or expired OTP');

      await prisma.oTPCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      const expert = await prisma.expert.findUnique({ where: { phone } });
      if (!expert) throw new ApiError(404, 'Expert not found. Please register first.');
      if (!expert.isActive) throw new ApiError(403, 'Account deactivated');

      const accessToken = this.generateAccessToken(expert.id, 'expert', 'expert');

      res.json({ success: true, data: { expert, accessToken } });
    } catch (error) {
      next(error);
    }
  };

  private generateAccessToken(id: string, role: string, type: string): string {
    return jwt.sign(
      { id, role, type },
      process.env.JWT_SECRET || 'secureconnect-secret-key',
      { expiresIn: '7d' }
    );
  }

  private generateRefreshToken(id: string): string {
    return jwt.sign(
      { id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'secureconnect-refresh-secret',
      { expiresIn: '30d' }
    );
  }
}
