import { SentimentResult } from '../sentiment';

export interface GoogleMapsReview {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
  language?: string;
}

export interface PlaceDetailsResponse {
  result?: {
    reviews?: GoogleMapsReview[];
  };
}

export interface ReviewUpdate {
  placeId: string;
  reviewId: string;
  text: string;
  rating: number;
  time: number;
  authorName: string;
  language: string;
}

export interface AnalyzedReviewUpdate extends ReviewUpdate {
  sentiment: SentimentResult;
}

export interface ReviewCollectorOptions {
  interval: number;
  maxRetries: number;
  retryDelay: number;
}