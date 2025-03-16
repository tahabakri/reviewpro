import { Redis } from 'ioredis';
import { GeminiClient, SentimentAnalysisResult } from '../gemini/client';
import { GeminiError } from '../gemini/error';

export interface ReviewData {
  id: string;
  text: string;
  createdAt: Date;
}

export interface AnalyzedReview extends SentimentAnalysisResult {
  reviewId: string;
  analyzedAt: Date;
}

export interface SentimentStats {
  positive: number;
  negative: number;
  neutral: number;
  averageScore: number;
  totalReviews: number;
  topPhrases: Array<{
    text: string;
    frequency: number;
    sentiment: string;
  }>;
}

export class SentimentAnalyzer {
  constructor(
    private gemini: GeminiClient,
    private redis: Redis,
    private cacheTTL: number = 3600 // 1 hour default
  ) {}

  private getCacheKey(reviewId: string): string {
    return `sentiment:review:${reviewId}`;
  }

  async analyzeReview(review: ReviewData): Promise<AnalyzedReview> {
    // Check cache first
    const cached = await this.getCachedAnalysis(review.id);
    if (cached) {
      return cached;
    }

    try {
      const analysis = await this.gemini.analyzeSentiment(review.text);
      const result: AnalyzedReview = {
        ...analysis,
        reviewId: review.id,
        analyzedAt: new Date()
      };

      // Cache the result
      await this.cacheAnalysis(review.id, result);
      return result;
    } catch (error) {
      if (error instanceof GeminiError && error.retryable) {
        // Implement retry logic here if needed
        throw error;
      }
      throw error;
    }
  }

  async batchAnalyze(reviews: ReviewData[]): Promise<AnalyzedReview[]> {
    const results: AnalyzedReview[] = [];
    const uncachedReviews: ReviewData[] = [];

    // Check cache for all reviews first
    for (const review of reviews) {
      const cached = await this.getCachedAnalysis(review.id);
      if (cached) {
        results.push(cached);
      } else {
        uncachedReviews.push(review);
      }
    }

    // Process uncached reviews in batches
    if (uncachedReviews.length > 0) {
      const batchResults = await this.processBatch(uncachedReviews);
      results.push(...batchResults);
    }

    return results;
  }

  async calculateStats(reviews: AnalyzedReview[]): Promise<SentimentStats> {
    const stats = {
      positive: 0,
      negative: 0,
      neutral: 0,
      averageScore: 0,
      totalReviews: reviews.length,
      topPhrases: [] as SentimentStats['topPhrases']
    };

    const phraseMap = new Map<string, { count: number; sentiment: string }>();

    for (const review of reviews) {
      // Count sentiments
      stats[review.sentiment]++;
      stats.averageScore += review.score;

      // Track phrases
      for (const phrase of review.keyPhrases) {
        const existing = phraseMap.get(phrase);
        if (existing) {
          existing.count++;
        } else {
          phraseMap.set(phrase, { count: 1, sentiment: review.sentiment });
        }
      }
    }

    // Calculate average score
    stats.averageScore = stats.averageScore / reviews.length;

    // Get top phrases
    stats.topPhrases = Array.from(phraseMap.entries())
      .map(([text, { count, sentiment }]) => ({
        text,
        frequency: count,
        sentiment
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    return stats;
  }

  private async getCachedAnalysis(reviewId: string): Promise<AnalyzedReview | null> {
    const cached = await this.redis.get(this.getCacheKey(reviewId));
    return cached ? JSON.parse(cached) : null;
  }

  private async cacheAnalysis(reviewId: string, analysis: AnalyzedReview): Promise<void> {
    await this.redis.setex(
      this.getCacheKey(reviewId),
      this.cacheTTL,
      JSON.stringify(analysis)
    );
  }

  private async processBatch(reviews: ReviewData[]): Promise<AnalyzedReview[]> {
    const batchSize = 5;
    const results: AnalyzedReview[] = [];

    for (let i = 0; i < reviews.length; i += batchSize) {
      const batch = reviews.slice(i, i + batchSize);
      const batchAnalysis = await Promise.all(
        batch.map(review => this.analyzeReview(review))
      );
      results.push(...batchAnalysis);

      // Add delay between batches to respect rate limits
      if (i + batchSize < reviews.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}