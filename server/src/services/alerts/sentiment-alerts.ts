import { EventEmitter } from 'events';
import { Redis } from 'ioredis';
import axios from 'axios';
import { AnalyzedReviewUpdate, SentimentStats } from '../../types/sentiment';
import { 
  AlertConfig, 
  AlertThresholds, 
  SentimentAlert, 
  AlertSubscription 
} from '../../types/alerts';

export class SentimentAlertService extends EventEmitter {
  private checkInterval: NodeJS.Timeout | null = null;
  private subscriptions: Map<string, AlertSubscription[]> = new Map();

  constructor(
    private redis: Redis,
    private config: AlertConfig = {
      thresholds: {
        sentimentDrop: 0.2,
        negativeSpike: 0.3,
        volumeIncrease: 2,
        timeWindow: 3600000 // 1 hour
      },
      checkInterval: 60000 // 1 minute
    }
  ) {
    super();
  }

  async subscribe(subscription: AlertSubscription): Promise<void> {
    const existing = this.subscriptions.get(subscription.placeId) || [];
    existing.push(subscription);
    this.subscriptions.set(subscription.placeId, existing);

    // Start monitoring if not already monitoring
    if (!this.checkInterval) {
      await this.startMonitoring(subscription.placeId);
    }

    // Store subscription in Redis
    await this.redis.sadd(
      `alert:subscriptions:${subscription.placeId}`,
      JSON.stringify(subscription)
    );
  }

  async unsubscribe(placeId: string, identifier: string): Promise<void> {
    const existing = this.subscriptions.get(placeId) || [];
    const filtered = existing.filter(sub => 
      (sub.email && sub.email !== identifier) || 
      (sub.webhook && sub.webhook !== identifier)
    );

    if (filtered.length === 0) {
      this.subscriptions.delete(placeId);
      this.stopMonitoring();
    } else {
      this.subscriptions.set(placeId, filtered);
    }

    // Update Redis
    await this.redis.del(`alert:subscriptions:${placeId}`);
    for (const sub of filtered) {
      await this.redis.sadd(
        `alert:subscriptions:${placeId}`,
        JSON.stringify(sub)
      );
    }
  }

  async startMonitoring(placeId: string): Promise<void> {
    // Stop any existing monitoring
    this.stopMonitoring();

    // Load existing subscriptions from Redis
    const storedSubs = await this.redis.smembers(`alert:subscriptions:${placeId}`);
    const subs = storedSubs.map(sub => JSON.parse(sub) as AlertSubscription);
    this.subscriptions.set(placeId, subs);

    this.checkInterval = setInterval(async () => {
      try {
        await this.checkAlerts(placeId);
      } catch (error) {
        console.error('Error checking sentiment alerts:', error);
      }
    }, this.config.checkInterval);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async checkAlerts(placeId: string): Promise<void> {
    const subs = this.subscriptions.get(placeId) || [];
    if (subs.length === 0) return;

    const timeWindow = this.config.thresholds.timeWindow;
    const now = Date.now();

    // Get recent reviews from Redis
    const recentReviews = await this.getRecentReviews(placeId, now - timeWindow);
    const previousReviews = await this.getRecentReviews(placeId, now - (timeWindow * 2), now - timeWindow);

    // Calculate stats for both periods
    const currentStats = this.calculateStats(recentReviews);
    const previousStats = this.calculateStats(previousReviews);

    if (!currentStats || !previousStats) return;

    // Check alerts for each subscription
    for (const sub of subs) {
      const thresholds = { ...this.config.thresholds, ...sub.thresholds };
      await this.checkAlertsForSubscription(sub, thresholds, placeId, currentStats, previousStats);
    }
  }

  private async checkAlertsForSubscription(
    sub: AlertSubscription,
    thresholds: AlertThresholds,
    placeId: string,
    currentStats: SentimentStats,
    previousStats: SentimentStats
  ): Promise<void> {
    const alerts: SentimentAlert[] = [];

    // Check for sentiment drop
    const sentimentChange = currentStats.averageScore - previousStats.averageScore;
    if (Math.abs(sentimentChange) >= thresholds.sentimentDrop) {
      alerts.push({
        type: 'sentiment-drop',
        placeId,
        message: `Significant sentiment drop detected: ${(sentimentChange * 100).toFixed(1)}%`,
        data: {
          previous: previousStats.averageScore,
          current: currentStats.averageScore,
          threshold: thresholds.sentimentDrop
        },
        timestamp: new Date()
      });
    }

    // Check for negative review spike
    const negativeRate = currentStats.negative / currentStats.totalReviews;
    const previousNegativeRate = previousStats.negative / previousStats.totalReviews;
    if (negativeRate >= thresholds.negativeSpike && negativeRate > previousNegativeRate) {
      alerts.push({
        type: 'negative-spike',
        placeId,
        message: `High negative review rate detected: ${(negativeRate * 100).toFixed(1)}%`,
        data: {
          previous: previousNegativeRate,
          current: negativeRate,
          threshold: thresholds.negativeSpike
        },
        timestamp: new Date()
      });
    }

    // Check for volume increase
    const volumeRatio = currentStats.totalReviews / previousStats.totalReviews;
    if (volumeRatio >= thresholds.volumeIncrease) {
      alerts.push({
        type: 'volume-increase',
        placeId,
        message: `Unusual increase in review volume: ${volumeRatio.toFixed(1)}x normal`,
        data: {
          previous: previousStats.totalReviews,
          current: currentStats.totalReviews,
          threshold: thresholds.volumeIncrease
        },
        timestamp: new Date()
      });
    }

    // Send alerts
    for (const alert of alerts) {
      await this.sendAlert(sub, alert);
    }
  }

  private async sendAlert(sub: AlertSubscription, alert: SentimentAlert): Promise<void> {
    // Emit event for internal handling
    this.emit('alert', alert);

    // Store in Redis
    const alertKey = `alert:${alert.placeId}:${alert.timestamp.getTime()}`;
    await this.redis.setex(alertKey, 86400, JSON.stringify(alert)); // Store for 24 hours

    // Send webhook if configured
    if (sub.webhook) {
      try {
        await axios.post(sub.webhook, alert);
      } catch (error) {
        console.error('Failed to send webhook alert:', error);
      }
    }

    // Send email if configured (implement email service integration)
    if (sub.email) {
      // TODO: Implement email notifications
    }
  }

  private async getRecentReviews(
    placeId: string, 
    startTime: number,
    endTime: number = Date.now()
  ): Promise<AnalyzedReviewUpdate[]> {
    const reviews: AnalyzedReviewUpdate[] = [];
    const keys = await this.redis.keys(`review:${placeId}:*`);
    
    for (const key of keys) {
      const reviewJson = await this.redis.get(key);
      if (reviewJson) {
        const review = JSON.parse(reviewJson) as AnalyzedReviewUpdate;
        if (review.time >= startTime && review.time < endTime) {
          reviews.push(review);
        }
      }
    }

    return reviews;
  }

  private calculateStats(reviews: AnalyzedReviewUpdate[]): SentimentStats | null {
    if (reviews.length === 0) return null;

    const positive = reviews.filter(r => r.sentiment.sentiment === 'positive').length;
    const negative = reviews.filter(r => r.sentiment.sentiment === 'negative').length;
    const neutral = reviews.length - positive - negative;

    const averageScore = reviews.reduce((sum, r) => sum + r.sentiment.score, 0) / reviews.length;

    return {
      positive,
      negative,
      neutral,
      averageScore,
      totalReviews: reviews.length,
      positiveRate: positive / reviews.length,
      negativeRate: negative / reviews.length,
      neutralRate: neutral / reviews.length,
      topPhrases: [] // Not needed for alerts
    };
  }

  // Subscribe to alerts
  onAlert(callback: (alert: SentimentAlert) => void): void {
    this.on('alert', callback);
  }

  // Get recent alerts
  async getRecentAlerts(placeId: string, limit: number = 10): Promise<SentimentAlert[]> {
    const keys = await this.redis.keys(`alert:${placeId}:*`);
    const alerts: SentimentAlert[] = [];

    for (const key of keys) {
      const alertJson = await this.redis.get(key);
      if (alertJson) {
        alerts.push(JSON.parse(alertJson));
      }
    }

    return alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}