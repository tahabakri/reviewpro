import { describe, it, expect, beforeEach, jest, afterAll } from '@jest/globals';
import { NotificationService, validateNotificationConfig } from '../../services/notifications';
import { EmailNotificationService } from '../../services/notifications/email-service';
import { SentimentAlert } from '../../types/alerts';
import { Transporter } from 'nodemailer';

// Mock nodemailer transporter
const mockTransporter = {
  verify: jest.fn().mockResolvedValue(true) as jest.Mock<Promise<boolean>>,
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }) as jest.Mock<Promise<{ messageId: string }>>
};

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => mockTransporter)
}));

describe('NotificationService', () => {
  let notificationService: NotificationService;
  const mockAlert: SentimentAlert = {
    type: 'sentiment-drop',
    placeId: 'test-place',
    message: 'Test alert',
    data: {
      previous: 0.8,
      current: 0.6,
      threshold: 0.2
    },
    timestamp: new Date()
  };

  beforeEach(() => {
    // Reset mocks
    mockTransporter.verify.mockClear();
    mockTransporter.sendMail.mockClear();

    // Set required environment variables
    process.env.EMAIL_HOST = 'smtp.test.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'test@test.com';
    process.env.EMAIL_PASS = 'testpass';
    process.env.EMAIL_FROM = 'alerts@test.com';

    // Get fresh instance
    notificationService = NotificationService.getInstance();
  });

  describe('initialization', () => {
    it('should initialize successfully with valid config', async () => {
      await expect(notificationService.initialize()).resolves.not.toThrow();
    });

    it('should validate environment variables', () => {
      expect(() => validateNotificationConfig()).not.toThrow();
    });

    it('should throw error for missing environment variables', () => {
      delete process.env.EMAIL_HOST;
      expect(() => validateNotificationConfig()).toThrow(/EMAIL_HOST/);
    });
  });

  describe('alert notifications', () => {
    it('should send alert email successfully', async () => {
      await expect(
        notificationService.sendAlertNotification('test@example.com', mockAlert)
      ).resolves.not.toThrow();
    });

    it('should send test email successfully', async () => {
      await expect(
        notificationService.sendTestNotification('test@example.com')
      ).resolves.not.toThrow();
    });

    it('should handle email service errors', async () => {
      // Mock email service failure
      jest.spyOn(EmailNotificationService.prototype, 'sendAlertEmail')
        .mockRejectedValueOnce(new Error('Send failed'));

      await expect(
        notificationService.sendAlertNotification('test@example.com', mockAlert)
      ).rejects.toThrow('Failed to send notification');
    });
  });

  describe('singleton behavior', () => {
    it('should return the same instance', () => {
      const instance1 = NotificationService.getInstance();
      const instance2 = NotificationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});

describe('EmailNotificationService', () => {
  let emailService: EmailNotificationService;

  beforeEach(() => {
    emailService = new EmailNotificationService({
      host: 'smtp.test.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@test.com',
        pass: 'testpass'
      }
    });
  });

  it('should format alert emails correctly', async () => {
    const mockAlert: SentimentAlert = {
      type: 'sentiment-drop',
      placeId: 'test-place',
      message: 'Test alert',
      data: {
        previous: 0.8,
        current: 0.6,
        threshold: 0.2
      },
      timestamp: new Date()
    };

    // Mock sendMail to capture email content
    const sendMailSpy = jest.spyOn(emailService, 'transporter' as keyof EmailNotificationService)
      .mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
      } as unknown as Transporter);

    await emailService.sendAlertEmail('test@example.com', mockAlert);

    // Verify email format
    const sendMailMock = (sendMailSpy.mock.results[0].value as Transporter).sendMail as jest.Mock;
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        subject: expect.stringContaining('Sentiment Drop'),
        html: expect.stringContaining('80.0%') // Previous sentiment
      })
    );
  });

  it('should verify email configuration', async () => {
    await expect(emailService.verifyConfiguration()).resolves.toBe(true);
  });
});

// Clean up environment after tests
afterAll(() => {
  delete process.env.EMAIL_HOST;
  delete process.env.EMAIL_PORT;
  delete process.env.EMAIL_USER;
  delete process.env.EMAIL_PASS;
  delete process.env.EMAIL_FROM;
});