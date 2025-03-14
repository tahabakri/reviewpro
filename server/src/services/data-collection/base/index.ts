import { DataCollector, CompetitorData, ReviewData } from '../../../types';

export class DataCollectionError extends Error {
  constructor(message: string, public platform: string) {
    super(message);
    this.name = 'DataCollectionError';
  }
}

export abstract class BaseDataCollector implements DataCollector {
  abstract platform: string;

  abstract searchCompetitors(query: string, location: string): Promise<CompetitorData[]>;
  abstract getReviews(id: string): Promise<ReviewData[]>;

  protected formatDate(date: string | Date): string {
    if (date instanceof Date) {
      return date.toISOString();
    }
    return new Date(date).toISOString();
  }

  protected generateId(prefix: string, timestamp: string | number | Date): string {
    const dateStr = timestamp instanceof Date 
      ? timestamp.getTime().toString()
      : typeof timestamp === 'string'
        ? new Date(timestamp).getTime().toString()
        : timestamp.toString();
    return `${prefix}_${dateStr}`;
  }

  protected ensureMetadata<T extends Record<string, unknown>>(metadata?: T): T {
    return metadata || {} as T;
  }
}

export { DataCollector, CompetitorData, ReviewData };