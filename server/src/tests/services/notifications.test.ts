import { NotificationService, NotificationConfig } from '../../services/notifications';
import { Alert, AlertType } from '../../types';
import { queues } from '../../config';

jest.mock('../../config', () => ({
  queues: {
    notifications: {
      add: jest.fn(),
    },
  },
}));

describe('NotificationService', () => {
  let service: NotificationService;
  const defaultConfig: NotificationConfig = {
    channels: ['in_app', 'email'],
    templates: {
      rating_threshold: (alert: Alert) => 
        `Rating alert: Average rating has dropped below ${alert.conditions.threshold}`,
      review_volume: (alert: Alert) =>
        `Volume alert: Received ${alert.conditions.threshold} reviews`,
    },
    webhookUrls: ['https://api.example.com/webhook'],
  };

  const mockAlert: Alert = {
    id: 'alert-1',
    business_id: 'business-1',
    type: 'rating_threshold',
    conditions: {
      threshold: 3.5,
      competitorId: 'competitor-1',
    },
    active: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService(defaultConfig);
    global.fetch = jest.fn();
  });

  describe('sendAlertNotification', () => {
    it('should queue notification with correct data', async () => {
      await service.sendAlertNotification(mockAlert, 'business-1');

      expect(queues.notifications.add).toHaveBeenCalledWith(
        'send-notification',
        expect.objectContaining({
          businessId: 'business-1',
          channels: defaultConfig.channels,
          notificationData: expect.objectContaining({
            alertId: mockAlert.id,
            type: mockAlert.type,
            message: expect.stringContaining('3.5'),
          }),
        })
      );
    });

    it('should use default template for unknown alert types', async () => {
      const unknownAlert: Alert = {
        ...mockAlert,
        type: 'unknown' as AlertType,
      };

      await service.sendAlertNotification(unknownAlert, 'business-1');

      expect(queues.notifications.add).toHaveBeenCalledWith(
        'send-notification',
        expect.objectContaining({
          notificationData: expect.objectContaining({
            message: expect.stringContaining('Conditions: threshold: 3.5, competitorId: competitor-1'),
          }),
        })
      );
    });
  });

  describe('processNotification', () => {
    const mockNotificationData = {
      type: 'test',
      userId: 'user-1',
      data: {
        message: 'Test notification',
      },
    };

    it('should process notifications for all configured channels', async () => {
      await service.processNotification(mockNotificationData);

      expect(queues.notifications.add).toHaveBeenCalledWith(
        'in-app-notification',
        expect.objectContaining({
          userId: 'user-1',
          notification: expect.objectContaining({
            type: 'test',
            message: 'Test notification',
          }),
        })
      );

      // Email channel is mocked and logged
      // Verify webhook call
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.any(String),
        })
      );
    });

    it('should handle webhook failures gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await service.processNotification(mockNotificationData);

      // Should not throw error and continue processing other channels
      expect(queues.notifications.add).toHaveBeenCalled();
    });

    it('should respect channel override in notification data', async () => {
      await service.processNotification({
        ...mockNotificationData,
        channels: ['in_app'],
      });

      expect(queues.notifications.add).toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled(); // Webhook should not be called
    });
  });

  describe('Template Rendering', () => {
    it('should render correct template for rating threshold alerts', async () => {
      const alert: Alert = {
        ...mockAlert,
        type: 'rating_threshold',
        conditions: {
          threshold: 4.0,
          competitorId: 'competitor-1',
        },
      };

      await service.sendAlertNotification(alert, 'business-1');

      expect(queues.notifications.add).toHaveBeenCalledWith(
        'send-notification',
        expect.objectContaining({
          notificationData: expect.objectContaining({
            message: 'Rating alert: Average rating has dropped below 4',
          }),
        })
      );
    });

    it('should render correct template for review volume alerts', async () => {
      const alert: Alert = {
        ...mockAlert,
        type: 'review_volume',
        conditions: {
          threshold: 10,
          timeWindow: 24 * 60 * 60 * 1000,
        },
      };

      await service.sendAlertNotification(alert, 'business-1');

      expect(queues.notifications.add).toHaveBeenCalledWith(
        'send-notification',
        expect.objectContaining({
          notificationData: expect.objectContaining({
            message: 'Volume alert: Received 10 reviews',
          }),
        })
      );
    });
  });
});