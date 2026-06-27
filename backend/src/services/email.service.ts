import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email: string, code: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'SecureConnect India <noreply@secureconnect.in>',
        to: email,
        subject: 'Email Verification - SecureConnect India',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
              <h1 style="color: white; margin: 0;">SecureConnect India</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 5px 0;">Your Safety, Our Priority</p>
            </div>
            <div style="padding: 30px 20px; text-align: center;">
              <h2>Email Verification</h2>
              <p>Your verification code is:</p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h1 style="color: #667eea; letter-spacing: 8px; margin: 0;">${code}</h1>
              </div>
              <p style="color: #666;">This code is valid for 10 minutes. Do not share it with anyone.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p>If you didn't request this code, please ignore this email.</p>
              <p>&copy; 2024 SecureConnect India. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendSOSAlertEmail(email: string, data: {
    userName: string;
    latitude: number;
    longitude: number;
    address?: string;
    time: string;
  }): Promise<boolean> {
    try {
      const mapUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'SecureConnect India <noreply@secureconnect.in>',
        to: email,
        subject: `EMERGENCY SOS ALERT - ${data.userName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px; background: #dc2626; border-radius: 10px;">
              <h1 style="color: white; margin: 0;">EMERGENCY SOS ALERT</h1>
            </div>
            <div style="padding: 30px 20px;">
              <h2 style="color: #dc2626;">Immediate Attention Required!</h2>
              <p><strong>${data.userName}</strong> has activated an emergency SOS alert.</p>
              <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p><strong>Time:</strong> ${data.time}</p>
                <p><strong>Location:</strong> ${data.address || 'See map link'}</p>
                <p><strong>Coordinates:</strong> ${data.latitude}, ${data.longitude}</p>
              </div>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${mapUrl}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  View Location on Map
                </a>
              </div>
              <p style="color: #666;">Please take immediate action to ensure their safety.</p>
            </div>
          </div>
        `,
      });

      return true;
    } catch (error) {
      console.error('SOS email failed:', error);
      return false;
    }
  }
}
