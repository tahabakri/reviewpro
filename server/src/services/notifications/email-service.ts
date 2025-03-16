import nodemailer from 'nodemailer';
import { SentimentAlert } from '../../types/alerts';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  body: string;
}

export class EmailNotificationService {
  private transporter: nodemailer.Transporter;
  
  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransport(config);
  }

  private getAlertTemplate(alert: SentimentAlert): EmailTemplate {
    const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
    
    const templates: Record<SentimentAlert['type'], (alert: SentimentAlert) => EmailTemplate> = {
      'sentiment-drop': (alert) => ({
        subject: `🔴 Significant Sentiment Drop Detected`,
        body: `
          <h2>Sentiment Alert</h2>
          <p>A significant drop in sentiment has been detected for your business.</p>
          <ul>
            <li>Previous Sentiment: ${formatPercentage(alert.data.previous)}</li>
            <li>Current Sentiment: ${formatPercentage(alert.data.current)}</li>
            <li>Change: ${formatPercentage(alert.data.current - alert.data.previous)}</li>
          </ul>
          <p>Please review recent customer feedback and take appropriate action.</p>
        `
      }),
      'negative-spike': (alert) => ({
        subject: `⚠️ High Volume of Negative Reviews`,
        body: `
          <h2>Negative Review Alert</h2>
          <p>An unusual increase in negative reviews has been detected.</p>
          <ul>
            <li>Previous Rate: ${formatPercentage(alert.data.previous)}</li>
            <li>Current Rate: ${formatPercentage(alert.data.current)}</li>
          </ul>
          <p>We recommend reviewing recent customer feedback immediately.</p>
        `
      }),
      'volume-increase': (alert) => ({
        subject: `📈 Unusual Review Volume Increase`,
        body: `
          <h2>Review Volume Alert</h2>
          <p>A significant increase in review volume has been detected.</p>
          <ul>
            <li>Previous Volume: ${alert.data.previous} reviews</li>
            <li>Current Volume: ${alert.data.current} reviews</li>
            <li>Increase Factor: ${(alert.data.current / alert.data.previous).toFixed(1)}x</li>
          </ul>
          <p>This could indicate an important event or trend.</p>
        `
      })
    };

    return templates[alert.type](alert);
  }

  async sendAlertEmail(to: string, alert: SentimentAlert): Promise<void> {
    const template = this.getAlertTemplate(alert);

    const emailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: template.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${template.body}
          <hr style="margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Alert generated at ${new Date(alert.timestamp).toLocaleString()}
            <br />
            Business ID: ${alert.placeId}
          </p>
          <p style="color: #666; font-size: 12px;">
            To manage your notification settings, please visit your dashboard.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(emailOptions);
    } catch (error) {
      console.error('Failed to send alert email:', error);
      throw new Error('Failed to send email notification');
    }
  }

  async sendTestEmail(to: string): Promise<void> {
    const emailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: '🔔 Sentiment Alert System Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test Email</h2>
          <p>This is a test email to verify your sentiment alert notifications are working correctly.</p>
          <p>If you received this email, your notification settings are properly configured.</p>
          <hr style="margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            Test email sent at ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(emailOptions);
    } catch (error) {
      console.error('Failed to send test email:', error);
      throw new Error('Failed to send test email');
    }
  }

  async verifyConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email configuration verification failed:', error);
      return false;
    }
  }
}