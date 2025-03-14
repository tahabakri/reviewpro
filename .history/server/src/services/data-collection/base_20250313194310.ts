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

// Re-export utility types and classes
export { DataCollectionError } from './error';
export { RateLimitConfig, RateLimiter } from './rate-limiter';