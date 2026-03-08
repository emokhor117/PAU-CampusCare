import { Injectable, Logger } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private client: BrevoClient;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail = 'paucampuscare@gmail.com';
  private readonly fromName = 'PAU CampusCare';

  constructor() {
    // New simplified initialization
    this.client = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY as string,
    });
    
    this.logger.log('Email service ready via BrevoClient');
  }


  // ── Send new student credentials ──────────────────────────────────────────
  async sendStudentCredentials(opts: { to: string; matric_number: string; password: string; display_name: string; }) {
    try {
      // Use the new transactionalEmails path
      await this.client.transactionalEmails.sendTransacEmail({
        subject: 'Your PAU CampusCare Account',
        sender: { email: this.fromEmail, name: this.fromName },
        to: [{ email: opts.to }],
        htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
          <div style="background: #003D8F; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">PAU CampusCare</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px;">Pan-Atlantic University Tele-Counselling Platform</p>
          </div>
          <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 8px;">Welcome to CampusCare</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Your student account has been created. Use the credentials below to log in for the first time. You will be asked to change your password on first login.
          </p>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="color: #94a3b8; padding: 6px 0; width: 140px;">Matriculation No.</td>
                <td style="color: #1e293b; font-weight: 600;">${opts.matric_number}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Temporary Password</td>
                <td style="color: #1e293b; font-weight: 600; font-family: monospace; font-size: 15px;">${opts.password}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Anonymous ID</td>
                <td style="color: #6366f1; font-weight: 600;">${opts.display_name}</td>
              </tr>
            </table>
          </div>
          <a href="${process.env.FRONTEND_URL || 'https://pau-campuscare.vercel.app'}/login"
            style="display: block; background: #003D8F; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
            Log in to CampusCare →
          </a>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message from PAU CampusCare. Please do not reply to this email.
          </p>
        </div>
      `,
      });
      
      this.logger.log(`Student credentials sent to ${opts.to}`);
    } catch (err) {
      this.logger.error(`Failed to send email: ${err.message}`);
    }
  }


  // ── Send new counsellor credentials ──────────────────────────────────────
  async sendCounsellorCredentials(opts: { to: string; matric_number: string; password: string; display_name: string; }) {
    try {
      // Use the new transactionalEmails path
      await this.client.transactionalEmails.sendTransacEmail({
        subject: 'Your PAU CampusCare Account',
        sender: { email: this.fromEmail, name: this.fromName },
        to: [{ email: opts.to }],
        htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
          <div style="background: #003D8F; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">PAU CampusCare</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px;">Pan-Atlantic University Tele-Counselling Platform</p>
          </div>
          <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 8px;">Welcome to CampusCare</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Your student account has been created. Use the credentials below to log in for the first time. You will be asked to change your password on first login.
          </p>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="color: #94a3b8; padding: 6px 0; width: 140px;">Matriculation No.</td>
                <td style="color: #1e293b; font-weight: 600;">${opts.matric_number}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Temporary Password</td>
                <td style="color: #1e293b; font-weight: 600; font-family: monospace; font-size: 15px;">${opts.password}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Anonymous ID</td>
                <td style="color: #6366f1; font-weight: 600;">${opts.display_name}</td>
              </tr>
            </table>
          </div>
          <a href="${process.env.FRONTEND_URL || 'https://pau-campuscare.vercel.app'}/login"
            style="display: block; background: #003D8F; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
            Log in to CampusCare →
          </a>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message from PAU CampusCare. Please do not reply to this email.
          </p>
        </div>
      `,
      });
      
      this.logger.log(`Student credentials sent to ${opts.to}`);
    } catch (err) {
      this.logger.error(`Failed to send email: ${err.message}`);
    }
  }

  // ── Notify a counsellor of a new session request ──────────────────────────
  async sendSessionNotification(opts: {
  to: string;
  session_id: number;
  is_priority: boolean;
}) {
  try {
    // In the modern SDK, use this.client.transactionalEmails.sendTransacEmail
    await this.client.transactionalEmails.sendTransacEmail({
      sender: { email: this.fromEmail, name: this.fromName },
      to: [{ email: opts.to }],
      subject: opts.is_priority
        ? '🔴 Priority Session Request — PAU CampusCare'
        : 'New Session Request — PAU CampusCare',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
          <div style="background: #003D8F; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">PAU CampusCare</h1>
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px;">Pan-Atlantic University Tele-Counselling Platform</p>
          </div>
          ${opts.is_priority ? `
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
            <span style="color: #dc2626; font-size: 14px; font-weight: 600;">🔴 This is a HIGH PRIORITY session request</span>
          </div>` : ''}
          <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 8px;">New Session Request</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            A student has requested a counselling session on PAU CampusCare and you have been assigned to review it.
          </p>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="color: #94a3b8; padding: 6px 0; width: 140px;">Session ID</td>
                <td style="color: #1e293b; font-weight: 600;">#${opts.session_id}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Priority</td>
                <td style="color: ${opts.is_priority ? '#dc2626' : '#16a34a'}; font-weight: 600;">
                  ${opts.is_priority ? 'HIGH' : 'NORMAL'}
                </td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 6px 0;">Requested At</td>
                <td style="color: #1e293b;">${new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}</td>
              </tr>
            </table>
          </div>
          <a href="${process.env.FRONTEND_URL || 'https://pau-campuscare.vercel.app'}/counsellor/sessions"
            style="display: block; background: #003D8F; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
            View Session on CampusCare →
          </a>
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            This is an automated message from PAU CampusCare. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    this.logger.log(`Session notification sent to ${opts.to} for session #${opts.session_id}`);
  } catch (err) {
    this.logger.error(`Failed to send session notification to ${opts.to}: ${err?.message || err}`);
  }
}

}