import { GeminiClient } from '../gemini/client';
import type { Redis } from '@redis/client';

// Redis adapter to normalize interface differences
class RedisAdapter {
  constructor(private client: Redis) {}

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<unknown> {
    if (options?.EX) {
      return this.client.setEx(key, options.EX, value);
    }
    return this.client.set(key, value);
  }
}

export interface ReviewData {
  id: string;
  text: string;
  createdAt: Date;
  source?: string;
}

type SentimentType = 'positive' | 'negative' | 'neutral';

export interface SentimentAnalysis {
  reviewId: string;
  sentiment: SentimentType;
  score: number;
  keyPhrases: string[];
  emotionalTone: string;
  analyzedAt: Date;
  source?: string;
}

// Result type for external consumers that need string sentiment
export interface SentimentResult extends Omit<SentimentAnalysis, 'sentiment'> {
  sentiment: string;
}

export interface AnalysisStats {
  averageScore: number;
  totalReviews: number;
  positive: number;
  negative: number;
  neutral: number;
  keyPhrases: { [phrase: string]: number };
  topPhrases: Array<{ phrase: string; count: number }>;
}

export type AnalyzerOptions = number | {
  batchSize?: number;
  processingInterval?: number;
  cacheTTL?: number;
};

const DEFAULT_OPTIONS = {
  batchSize: 10,
  processingInterval: 5000,
  cacheTTL: 86400 // 24 hours
};

export class SentimentAnalyzer {
  private gemini: GeminiClient;
  private redis: RedisAdapter;
  private options: typeof DEFAULT_OPTIONS;
  private queue: ReviewData[] = [];
  private isProcessing = false;

  constructor(
    gemini: GeminiClient,
    redis: Redis,
    options: AnalyzerOptions = DEFAULT_OPTIONS
  ) {
    this.gemini = gemini;
    this.redis = new RedisAdapter(redis);
    this.options = typeof options === 'number'
      ? { ...DEFAULT_OPTIONS, cacheTTL: options }
      : { ...DEFAULT_OPTIONS, ...options };
    this.setupProcessor();
  }

  async analyzeReview(review: ReviewData): Promise<SentimentResult> {
    const cacheKey = `sentiment:${review.id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached) as SentimentAnalysis;
      return this.toSentimentResult(parsed);
    }

    const result = await this.gemini.analyzeSentiment(review.text);
    const sentiment = this.classifySentiment(result.score);
    
    const analysis: SentimentAnalysis = {
      reviewId: review.id,
      sentiment,
      score: result.score,
      keyPhrases: result.keyPhrases,
      emotionalTone: this.getEmotionalTone(result.score),
      analyzedAt: new Date(),
      source: review.source
    };

    await this.redis.set(cacheKey, JSON.stringify(analysis), {
      EX: this.options.cacheTTL
    });
    return this.toSentimentResult(analysis);
  }

  private toSentimentResult(analysis: SentimentAnalysis): SentimentResult {
    return {
      ...analysis,
      sentiment: analysis.sentiment.toString()
    };
  }

  private classifySentiment(score: number): SentimentType {
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

  async batchAnalyze(reviews: ReviewData[]): Promise<SentimentResult[]> {
    const results = await Promise.allSettled(
      reviews.map(review => this.analyzeReview(review))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<SentimentResult> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }

  async calculateStats(analyses: SentimentResult[]): Promise<AnalysisStats> {
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
      distribution[analysis.sentiment as SentimentType]++;
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
      topPhrases
    };
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const batch = this.queue.splice(0, this.options.batchSize);
    
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
    }, this.options.processingInterval);
  }

  addToQueue(review: ReviewData): void {
    this.queue.push(review);
    if (this.queue.length >= this.options.batchSize && !this.isProcessing) {
      void this.processBatch();
    }
  }
}