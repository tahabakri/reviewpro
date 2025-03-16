import { Redis } from 'redis';
import { GeminiClient } from '../gemini/client';

export interface ReviewData {
  id: string;
  text: string;
  createdAt: Date;
  source?: string;
}

export interface SentimentAnalysis {
  reviewId: string;
  text: string;
  score: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  keyPhrases: string[];
  analyzedAt: Date;
  emotionalTone: string;
  source?: string;
}

export interface AnalysisStats {
  averageScore: number;
  totalReviews: number;
  positive: number;
  negative: number;
  neutral: number;
  keyPhrases: { [phrase: string]: number };
  topPhrases: Array<{ phrase: string; count: number }>;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export class SentimentAnalyzer {
  private gemini: GeminiClient;
  private redis: Redis;
  private batchSize: number;
  private processingInterval: number;
  private cacheTTL: number;
  private queue: ReviewData[] = [];
  private isProcessing = false;

  constructor(
    gemini: GeminiClient,
    redis: Redis,
    options = {
      batchSize: 10,
      processingInterval: 5000,
      cacheTTL: 86400 // 24 hours
    }
  ) {
    this.gemini = gemini;
    this.redis = redis;
    this.batchSize = options.batchSize;
    this.processingInterval = options.processingInterval;
    this.cacheTTL = options.cacheTTL;
    this.setupProcessor();
  }

  async analyzeReview(review: ReviewData): Promise<SentimentAnalysis> {
    const cacheKey = `sentiment:${review.id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await this.gemini.analyzeSentiment(review.text);
    const sentiment = this.classifySentiment(result.score);
    
    const analysis: SentimentAnalysis = {
      reviewId: review.id,
      text: review.text,
      score: result.score,
      sentiment,
      keyPhrases: result.keyPhrases,
      analyzedAt: new Date(),
      emotionalTone: this.getEmotionalTone(result.score),
      source: review.source
    };

    await this.redis.set(cacheKey, JSON.stringify(analysis), {
      EX: this.cacheTTL
    });
    return analysis;
  }

  private classifySentiment(score: number): 'positive' | 'neutral' | 'negative' {
    if (score > 0.33) return 'positive';
    if (score < -0.33) return 'negative';
    return 'neutral';
  }

  private getEmotionalTone(score: number): string {
    if (score > 0.66) return 'very positive';
    if (score > 0.33) return 'positive';
    if (score > -0.33) return 'neutral';
    if (score > -0.66) return 'negative';
    return 'very negative';
  }

  async batchAnalyze(reviews: ReviewData[]): Promise<SentimentAnalysis[]> {
    const results = await Promise.allSettled(
      reviews.map(review => this.analyzeReview(review))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<SentimentAnalysis> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  async calculateStats(analyses: SentimentAnalysis[]): Promise<AnalysisStats> {
    let totalScore = 0;
    const keyPhraseCount: { [phrase: string]: number } = {};
    const distribution = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    analyses.forEach(analysis => {
      totalScore += analysis.score;
      analysis.keyPhrases.forEach(phrase => {
        keyPhraseCount[phrase] = (keyPhraseCount[phrase] || 0) + 1;
      });
      distribution[analysis.sentiment]++;
    });

    const topPhrases = Object.entries(keyPhraseCount)
      .map(([phrase, count]) => ({ phrase, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      averageScore: analyses.length ? totalScore / analyses.length : 0,
      totalReviews: analyses.length,
      positive: distribution.positive,
      negative: distribution.negative,
      neutral: distribution.neutral,
      keyPhrases: keyPhraseCount,
      topPhrases,
      sentimentDistribution: distribution
    };
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      await this.batchAnalyze(batch);
    } catch (error) {
      console.error('Error processing batch:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private setupProcessor(): void {
    setInterval(async () => {
      if (this.queue.length > 0 && !this.isProcessing) {
        await this.processBatch();
      }
    }, this.processingInterval);
  }

  addToQueue(review: ReviewData): void {
    this.queue.push(review);
    if (this.queue.length >= this.batchSize && !this.isProcessing) {
      void this.processBatch();
    }
  }
}