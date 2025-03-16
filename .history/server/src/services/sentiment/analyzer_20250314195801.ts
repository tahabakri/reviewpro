import { createClient } from 'redis';
import { GeminiClient } from '../gemini/client';

export interface ReviewData {
  id: string;
  text: string;
  timestamp: number;
  source?: string;
}

export interface SentimentAnalysis {
  reviewId: string;
  score: number;
  keyPhrases: string[];
  timestamp: number;
  source?: string;
}

export interface AnalysisStats {
  averageScore: number;
  totalReviews: number;
  keyPhrases: { [phrase: string]: number };
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export class SentimentAnalyzer {
  private gemini: GeminiClient;
  private redis: ReturnType<typeof createClient>;
  private batchSize: number;
  private processingInterval: number;
  private cacheTTL: number;
  private queue: ReviewData[] = [];
  private isProcessing = false;

  constructor(
    gemini: GeminiClient,
    redisUrl: string,
    options = {
      batchSize: 10,
      processingInterval: 5000,
      cacheTTL: 86400 // 24 hours
    }
  ) {
    this.gemini = gemini;
    this.redis = createClient({ url: redisUrl });
    this.batchSize = options.batchSize;
    this.processingInterval = options.processingInterval;
    this.cacheTTL = options.cacheTTL;
    this.setupProcessor();
  }

  async connect(): Promise<void> {
    await this.redis.connect();
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }

  async analyzeReview(review: ReviewData): Promise<SentimentAnalysis> {
    const cacheKey = `sentiment:${review.id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await this.gemini.analyzeSentiment(review.text);
    const analysis: SentimentAnalysis = {
      reviewId: review.id,
      score: result.score,
      keyPhrases: result.keyPhrases,
      timestamp: review.timestamp,
      source: review.source
    };

    await this.redis.set(cacheKey, JSON.stringify(analysis), {
      EX: this.cacheTTL
    });
    return analysis;
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

      if (analysis.score > 0.33) {
        distribution.positive++;
      } else if (analysis.score < -0.33) {
        distribution.negative++;
      } else {
        distribution.neutral++;
      }
    });

    return {
      averageScore: analyses.length ? totalScore / analyses.length : 0,
      totalReviews: analyses.length,
      keyPhrases: keyPhraseCount,
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