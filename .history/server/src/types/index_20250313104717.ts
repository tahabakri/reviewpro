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
  facebook: {
    appId: string;
    appSecret: string;
  };
}

export interface Alert {
  id: string;
  business_id: string;
  type: AlertType;
  conditions: AlertConditions;
  active: boolean;
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

export interface Review {
  id: string;
  entity_id: string;
  rating: number;
  content: string;
  created_at: string;
  platform: string;
}

export interface Sentiment {
  id: string;
  entity_id: string;
  score: number;
  analysis: Record<string, unknown>;
}

export interface DataCollector {
  platform: string;
  getReviews(id: string): Promise<Array<Review>>;
}