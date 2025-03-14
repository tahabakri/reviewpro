import { Sentiment, Theme } from '../../types';

export interface SentimentAnalysis {
  score: number;
  magnitude: number;
  analysis: {
    sentences?: Array<{
      text?: string | null;
      sentiment?: {
        score?: number | null;
        magnitude?: number | null;
      };
    }>;
  };
}

export interface InternalProcessedReview {
  id: string;
  entity_id: string;
  rating: number;
  content: string;
  platform: string;
  created_at: string;
  sentiment: SentimentAnalysis;
  themes: Theme[];
}

export interface StoredProcessedReview {
  id: string;
  entity_id: string;
  content: string;
  rating: number;
  platform: string;
  created_at: string;
  sentiment_score: number;
  sentiment_magnitude: number;
  sentiment_analysis: Record<string, unknown>;
  themes: Theme[];
}

export interface SentimentRecord extends Sentiment {
  score: number;
  magnitude: number;
  analysis: Record<string, unknown>;
}