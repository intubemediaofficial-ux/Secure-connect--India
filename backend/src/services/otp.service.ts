import { OTP_CONFIG } from '../config/constants';

export class OTPService {
  generateOTP(): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < OTP_CONFIG.length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  async sendSMS(phone: string, otp: string): Promise<boolean> {
    try {
      // In production, use Twilio
      if (process.env.NODE_ENV === 'production' && process.env.TWILIO_ACCOUNT_SID) {
        const twilio = require('twilio');
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        await client.messages.create({
          body: `Your SecureConnect India verification code is: ${otp}. Valid for ${OTP_CONFIG.expiryMinutes} minutes. Do not share this code.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+91${phone}`,
        });

        return true;
      }

      // Development mode - log OTP
      console.log(`[DEV OTP] Phone: ${phone}, OTP: ${otp}`);
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  async sendSOSAlert(phone: string, message: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'production' && process.env.TWILIO_ACCOUNT_SID) {
        const twilio = require('twilio');
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+91${phone}`,
        });

        return true;
      }

      console.log(`[DEV SOS SMS] Phone: ${phone}, Message: ${message}`);
      return true;
    } catch (error) {
      console.error('SOS SMS failed:', error);
      return false;
    }
  }
}
