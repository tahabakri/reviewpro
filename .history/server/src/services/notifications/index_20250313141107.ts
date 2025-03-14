import { queues } from '../../config';
import { Alert } from '../../types';

export type NotificationChannel = 'email' | 'in_app' | 'webhook';

export interface NotificationConfig {
  channels: NotificationChannel[];
  templates: Record<string, (data: any) => string>;
  webhookUrls?: string[];
}

export interface NotificationData {
  type: string;
  userId: string;
  data: Record<string, unknown>;
  channels?: NotificationChannel[];
}

export class NotificationService {
  private config: NotificationConfig;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  async sendAlertNotification(alert: Alert, businessId: string): Promise<void> {
    const notificationData = this.formatAlertData(alert);

    await queues.notifications.add('send-notification', {
      businessId,
      notificationData,
      channels: this.config.channels,
    });
  }

  private formatAlertData(alert: Alert): Record<string, unknown> {
    const template = this.config.templates[alert.type] || this.defaultTemplate;
    const message = template(alert);

    return {
      alertId: alert.id,
      type: alert.type,
      message,
      conditions: alert.conditions,
      timestamp: new Date().toISOString(),
    };
  }

  private defaultTemplate(alert: Alert): string {
    const conditions = Object.entries(alert.conditions)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    return `Alert triggered: ${alert.type}\nConditions: ${conditions}`;
  }

  async processNotification(data: NotificationData): Promise<void> {
    const channels = data.channels || this.config.channels;

    await Promise.all(
      channels.map((channel) => this.sendToChannel(channel, data))
    );
  }

  private async sendToChannel(
    channel: NotificationChannel,
    data: NotificationData
  ): Promise<void> {
    switch (channel) {
      case 'email':
        await this.sendEmail(data);
        break;
      case 'in_app':
        await this.sendInApp(data);
        break;
      case 'webhook':
        await this.sendWebhook(data);
        break;
      default:
        console.warn(`Unsupported notification channel: ${channel}`);
    }
  }

  private async sendEmail(data: NotificationData): Promise<void> {
    // TODO: Implement email sending
    console.log('Sending email notification:', data);
  }

  private async sendInApp(data: NotificationData): Promise<void> {
    await queues.notifications.add('in-app-notification', {
      userId: data.userId,
      notification: {
        type: data.type,
        message: data.data.message,
        data: data.data,
        timestamp: new Date().toISOString(),
        read: false,
      },
    });
  }

  private async sendWebhook(data: NotificationData): Promise<void> {
    if (!this.config.webhookUrls?.length) return;

    const payload = {
      type: data.type,
      data: data.data,
      timestamp: new Date().toISOString(),
    };

    await Promise.all(
      this.config.webhookUrls.map((url) =>
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }).catch((error) => {
          console.error(`Failed to send webhook to ${url}:`, error);
        })
      )
    );
  }
}

// Create default notification service instance
export const notificationService = new NotificationService({
  channels: ['in_app'],
  templates: {
    rating_threshold: (alert: Alert) =>
      `Rating alert: Average rating has dropped below ${alert.conditions.threshold}`,
    review_volume: (alert: Alert) =>
      `Volume alert: Received ${alert.conditions.threshold} reviews in the specified time window`,
    sentiment_drop: (alert: Alert) =>
      `Sentiment alert: Average sentiment has dropped below ${alert.conditions.threshold}`,
  },
});