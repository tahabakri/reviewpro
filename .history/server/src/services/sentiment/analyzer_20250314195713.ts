import { createClient } from 'redis';
import { GeminiClient } from '../gemini/client';

interface Review {
  id: string;
  text: string;
  timestamp: number;
}

interface SentimentResult {
  score: number;
  keyPhrases: string[];
  timestamp: number;
}

export class SentimentAnalyzer {
  private gemini: GeminiClient;
  private redis: ReturnType<typeof createClient>;
  private batchSize: number;
  private processingInterval: number;
  private queue: Review[] = [];
  private isProcessing = false;

  constructor(
    gemini: GeminiClient,
    redisUrl: string,
    batchSize: number,
    processingInterval: number,
    cacheTTL: number
  ) {
    this.gemini = gemini;
    this.redis = createClient({ url: redisUrl });
    this.batchSize = batchSize;
    this.processingInterval = processingInterval;
    this.setupProcessor();
  }

  async connect(): Promise<void> {
    await this.redis.connect();
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }

  async analyzeSentiment(review: Review): Promise<SentimentResult> {
    const cacheKey = `sentiment:${review.id}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await this.gemini.analyzeSentiment(review.text);
    const sentimentResult = {
      ...result,
      timestamp: review.timestamp
    };

    await this.redis.set(cacheKey, JSON.stringify(sentimentResult));
    return sentimentResult;
  }

  async addToQueue(review: Review): Promise<void> {
    this.queue.push(review);
    if (this.queue.length >= this.batchSize && !this.isProcessing) {
      await this.processBatch();
    }
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      const results = await Promise.allSettled(
        batch.map(review => this.analyzeSentiment(review))
      );

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to analyze review ${batch[index].id}:`, result.reason);
        }
      });
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

  async getTrends(timeRange: number): Promise<{
    averageScore: number;
    totalReviews: number;
    keyPhrases: { [phrase: string]: number };
  }> {
    const now = Date.now();
    const start = now - timeRange;
    
    const keys = await this.redis.keys('sentiment:*');
    const results = await Promise.all(
      keys.map(key => this.redis.get(key))
    );

    const validResults = results
      .filter((r): r is string => r !== null)
      .map(r => JSON.parse(r) as SentimentResult)
      .filter(r => r.timestamp >= start);

    const keyPhraseCount: { [phrase: string]: number } = {};
    let totalScore = 0;

    validResults.forEach(result => {
      totalScore += result.score;
      result.keyPhrases.forEach(phrase => {
        keyPhraseCount[phrase] = (keyPhraseCount[phrase] || 0) + 1;
      });
    });

    return {
      averageScore: validResults.length ? totalScore / validResults.length : 0,
      totalReviews: validResults.length,
      keyPhrases: keyPhraseCount
    };
  }
}