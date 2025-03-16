// Updated imports with explicit file extensions
import { EmailNotificationService } from './email-service.js';
import { SentimentAlert } from '../../types/alerts.js';

export class NotificationService {
  private emailService: EmailNotificationService | null = null;
  private static instance: NotificationService;

  private constructor() {
    // Don't initialize email service in constructor
    // Will be initialized in initialize() method
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    // Validate environment variables first
    validateNotificationConfig();

    // Initialize email service with validated config
    this.emailService = new EmailNotificationService({
      host: process.env.EMAIL_HOST!,
      port: parseInt(process.env.EMAIL_PORT!, 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!
      }
    });

    // Verify the configuration
    const isConfigValid = await this.emailService.verifyConfiguration();
    if (!isConfigValid) {
      throw new Error('Email service configuration is invalid');
    }
  }

  async sendAlertNotification(
    email: string,
    alert: SentimentAlert
  ): Promise<void> {
    if (!this.emailService) {
      throw new Error('Email service not initialized');
    }

    try {
      await this.emailService.sendAlertEmail(email, alert);
    } catch (error) {
      console.error('Failed to send alert notification:', error);
      throw new Error('Failed to send notification');
    }
  }

  async sendTestNotification(email: string): Promise<void> {
    if (!this.emailService) {
      throw new Error('Email service not initialized');
    }

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
      `Missing required environment variables: ${missing.join(', ')}`)
  }

  // Validate port is a number
  const port = parseInt(process.env.EMAIL_PORT!, 10);
  if (isNaN(port)) {
    throw new Error('EMAIL_PORT must be a valid number');
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();