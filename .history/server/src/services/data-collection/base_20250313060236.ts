export interface ReviewData {
  id: string;
  rating: number;
  content: string;
  platform: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface CompetitorData {
  name: string;
  platform: string;
  externalId: string;
  metadata?: Record<string, any>;
}

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
}

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