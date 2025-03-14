import type { CompetitorData as BaseCompetitorData, ReviewData as BaseReviewData } from '../../types';

// Re-export types with aliases for backward compatibility
export type CompetitorData = BaseCompetitorData;
export type ReviewData = BaseReviewData;

export abstract class DataCollectionService {
  abstract platform: string;

  abstract searchCompetitors(query: string, location: string): Promise<CompetitorData[]>;
  
  abstract getReviews(competitorId: string): Promise<ReviewData[]>;
  
  protected formatDate(date: string | Date): string {
    return new Date(date).toISOString();
  }

  protected generateId(platform: string, externalId: string): string {
    return `${platform}_${externalId}`;
  }

  protected ensureMetadata(data: Record<string, unknown>): Record<string, unknown> {
    return Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, unknown>);
  }
}

export { DataCollectionError } from './error';
export { RateLimitConfig, RateLimiter } from './rate-limiter';

export class DataCollectionError extends Error {
  constructor(
    message: string,
    public readonly platform: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'DataCollectionError';
  }
}

export interface RateLimitConfig {
  requestsPerSecond: number;
  maxRetries: number;
  retryDelay: number;
}

export class RateLimiter {
  private lastRequest: number = 0;
  private requestQueue: Promise<void> = Promise.resolve();

  constructor(private config: RateLimitConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue = this.requestQueue
        .then(async () => {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequest;
          const minDelay = (1000 / this.config.requestsPerSecond);
          
          if (timeSinceLastRequest < minDelay) {
            await new Promise(r => setTimeout(r, minDelay - timeSinceLastRequest));
          }
          
          this.lastRequest = Date.now();
          let lastError;
          
          for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
            try {
              const result = await fn();
              resolve(result);
              return;
            } catch (error) {
              lastError = error;
              if (attempt < this.config.maxRetries - 1) {
                await new Promise(r => setTimeout(r, this.config.retryDelay));
              }
            }
          }
          
          reject(lastError);
        })
        .catch(reject);
    });
  }
}