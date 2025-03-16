import { EventEmitter } from 'events';
import { Redis } from 'ioredis';
import { AnalyzedReviewUpdate, SentimentStats } from '../../../src/types/sentiment';

interface AlertThresholds {
  sentimentDrop: number;   // e.g., 0.2 for 20% drop
  negativeSpike: number;   // e.g., 0.3 for 30% negative reviews
  volumeIncrease: number;  // e.g., 2 for double the normal volume
  timeWindow: number;      // in milliseconds
}

interface AlertConfig {
  thresholds: AlertThresholds;
  checkInterval: number;   // in milliseconds
}

export interface SentimentAlert {
  type: 'sentiment-drop' | 'negative-spike' | 'volume-increase';
  placeId: string;
  message: string;
  data: {
    previous: number;
    current: number;
    threshold: number;
  };
  timestamp: Date;
}

export class SentimentAlertService extends EventEmitter {
  private checkInterval: NodeJS.Timeout | null = null;

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

  async startMonitoring(placeId: string): Promise<void> {
    // Stop any existing monitoring
    this.stopMonitoring();

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
    const timeWindow = this.config.thresholds.timeWindow;
    const now = Date.now();

    // Get recent reviews from Redis
    const recentReviews = await this.getRecentReviews(placeId, now - timeWindow);
    const previousReviews = await this.getRecentReviews(placeId, now - (timeWindow * 2), now - timeWindow);

    // Calculate stats for both periods
    const currentStats = this.calculateStats(recentReviews);
    const previousStats = this.calculateStats(previousReviews);

    if (!currentStats || !previousStats) return;

    // Check for sentiment drop
    const sentimentChange = currentStats.averageScore - previousStats.averageScore;
    if (Math.abs(sentimentChange) >= this.config.thresholds.sentimentDrop) {
      this.emitAlert({
        type: 'sentiment-drop',
        placeId,
        message: `Significant sentiment drop detected: ${(sentimentChange * 100).toFixed(1)}%`,
        data: {
          previous: previousStats.averageScore,
          current: currentStats.averageScore,
          threshold: this.config.thresholds.sentimentDrop
        },
        timestamp: new Date()
      });
    }

    // Check for negative review spike
    const negativeRate = currentStats.negative / currentStats.totalReviews;
    const previousNegativeRate = previousStats.negative / previousStats.totalReviews;
    if (negativeRate >= this.config.thresholds.negativeSpike && 
        negativeRate > previousNegativeRate) {
      this.emitAlert({
        type: 'negative-spike',
        placeId,
        message: `High negative review rate detected: ${(negativeRate * 100).toFixed(1)}%`,
        data: {
          previous: previousNegativeRate,
          current: negativeRate,
          threshold: this.config.thresholds.negativeSpike
        },
        timestamp: new Date()
      });
    }

    // Check for volume increase
    const volumeRatio = currentStats.totalReviews / previousStats.totalReviews;
    if (volumeRatio >= this.config.thresholds.volumeIncrease) {
      this.emitAlert({
        type: 'volume-increase',
        placeId,
        message: `Unusual increase in review volume: ${volumeRatio.toFixed(1)}x normal`,
        data: {
          previous: previousStats.totalReviews,
          current: currentStats.totalReviews,
          threshold: this.config.thresholds.volumeIncrease
        },
        timestamp: new Date()
      });
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

  private emitAlert(alert: SentimentAlert): void {
    this.emit('alert', alert);
    
    // Also store in Redis for persistence
    const alertKey = `alert:${alert.placeId}:${alert.timestamp.getTime()}`;
    this.redis.setex(alertKey, 86400, JSON.stringify(alert)); // Store for 24 hours
  }

  // Subscribe to alerts
  onAlert(callback: (alert: SentimentAlert) => void): void {
    this.on('alert', callback);
  }
}