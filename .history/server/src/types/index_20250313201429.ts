export interface DataCollector {
  platform: string;
  searchCompetitors(query: string, location: string): Promise<CompetitorData[]>;
  getReviews(id: string): Promise<ReviewData[]>;
}

export interface CompetitorData {
  name: string;
  platform: string;
  externalId: string;
  metadata: Record<string, unknown>;
}

export interface ReviewData {
  id: string;
  rating: number;
  content: string;
  platform: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface ProcessedReview extends ReviewData {
  sentiment: Sentiment;
  themes: Theme[];
}

export interface Sentiment {
  id: string;
  entity_id: string;
  score: number;
  magnitude?: number;
  analysis: Record<string, unknown>;
}

export interface Theme {
  review_id: string;
  category: string;
  sentiment: number;
  frequency: number;
}

export type AlertType = 
  | 'rating_threshold'
  | 'review_volume'
  | 'sentiment_drop'
  | 'data_collection_error';

export interface AlertConditions {
  competitorId?: string;
  platform?: string;
  threshold?: number;
  sampleSize?: number;
  timeWindow?: number;
  oneTime?: boolean;
  error?: string;
}

export interface Alert {
  id: string;
  business_id: string;
  type: AlertType;
  conditions: AlertConditions;
  active: boolean;
}

export interface ServiceAccount {
  clientEmail: string;
  privateKey: string;
}

export interface ApiConfig {
  google: {
    apiKey: string;
    placesApiKey: string;
    serviceAccount: ServiceAccount;
  };
  yelp: {
    apiKey: string;
  };
  tripadvisor: {
    apiKey: string;
  };
}

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
}

export interface DatabaseConfig {
  url: string;
  key: string;
}

export interface Config {
  apis: ApiConfig;
  redis: RedisConfig;
  database: DatabaseConfig;
}

export interface InAppNotification {
  id?: string;
  userId: string;
  type: string;
  message: string;
  data: Record<string, unknown>;
  timestamp: string;
  read: boolean;
}