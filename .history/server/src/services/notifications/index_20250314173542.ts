import { EmailNotificationService } from './email-service';
import { SentimentAlert } from '../../types/alerts';

export class NotificationService {
  private emailService: EmailNotificationService;
  private static instance: NotificationService;

  private constructor() {
    this.emailService = new EmailNotificationService({
      host: process.env.EMAIL_HOST || '',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      }
    });
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    const isConfigValid = await this.emailService.verifyConfiguration();
    if (!isConfigValid) {
      throw new Error('Email service configuration is invalid');
    }
  }

  async sendAlertNotification(
    email: string,
    alert: SentimentAlert
  ): Promise<void> {
    try {
      await this.emailService.sendAlertEmail(email, alert);
    } catch (error) {
      console.error('Failed to send alert notification:', error);
      throw new Error('Failed to send notification');
    }
  }

  async sendTestNotification(email: string): Promise<void> {
    try {
      await this.emailService.sendTestEmail(email);
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw new Error('Failed to send test notification');
    }
  }
}

// Environment validation
export function validateNotificationConfig(): void {
  const required = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASS',
    'EMAIL_FROM'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();