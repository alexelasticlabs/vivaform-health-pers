import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: Transporter;

  constructor() {
    // Use SMTP config from environment
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;

    if (!smtpUser || !smtpPass) {
      this.logger.warn('SMTP credentials not configured. Emails will be logged only.');
      // Create ethereal test account for development
      this.createEtherealTransporter();
    } else {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }
  }

  private async createEtherealTransporter() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log('Using Ethereal email for testing');
    } catch (error) {
      this.logger.error('Failed to create Ethereal account', error);
    }
  }

  async sendWelcomeEmail(email: string, name: string) {
    const subject = 'Welcome to VivaForm! 🎉';
    const html = this.getWelcomeTemplate(name);

    await this.sendEmail(email, subject, html);
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.WEB_URL || 'http://localhost:5175'}/verify-email?token=${token}`;
    const subject = 'Verify Your VivaForm Email';
    const html = this.getVerificationTemplate(verificationUrl);

    await this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.WEB_URL || 'http://localhost:5175'}/reset-password?token=${token}`;
    const subject = 'Reset Your VivaForm Password';
    const html = this.getPasswordResetTemplate(resetUrl);

    await this.sendEmail(email, subject, html);
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"VivaForm" <noreply@vivaform.app>',
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent: ${info.messageId}`);
      
      // Log preview URL for Ethereal
      if (process.env.NODE_ENV === 'development') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`Preview URL: ${previewUrl}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  }

  private getWelcomeTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 40px 20px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🥗 Welcome to VivaForm!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Welcome to VivaForm — your personalized nutrition and wellness companion! 🎉</p>
              <p>We're excited to help you achieve your health goals through:</p>
              <ul>
                <li>📊 Personalized meal plans based on your preferences</li>
                <li>💪 Macro tracking and calorie insights</li>
                <li>💧 Water intake reminders</li>
                <li>📈 Progress tracking and recommendations</li>
              </ul>
              <p>Ready to start your journey?</p>
              <a href="${process.env.WEB_URL || 'http://localhost:5175'}/dashboard" class="button">Go to Dashboard →</a>
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>Best regards,<br>The VivaForm Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} VivaForm. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getVerificationTemplate(verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 40px 20px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✉️ Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Thank you for signing up with VivaForm!</p>
              <p>Please verify your email address by clicking the button below:</p>
              <a href="${verificationUrl}" class="button">Verify Email Address →</a>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create a VivaForm account, you can safely ignore this email.</p>
              <p>Best regards,<br>The VivaForm Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} VivaForm. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 40px 20px; border: 1px solid #e5e7eb; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Reset Your Password</h1>
            </div>
            <div class="content">
              <p>We received a request to reset your VivaForm password.</p>
              <p>Click the button below to create a new password:</p>
              <a href="${resetUrl}" class="button">Reset Password →</a>
              <p>This link will expire in 1 hour.</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                If you didn't request this password reset, please ignore this email and ensure your account is secure.
              </div>
              <p>Best regards,<br>The VivaForm Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} VivaForm. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
