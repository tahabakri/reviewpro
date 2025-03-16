import { SentimentResult } from '../sentiment';
import { WebSocket } from 'ws';
import { Redis } from 'ioredis';
import { SentimentAnalyzer } from '../sentiment/analyzer';

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

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe';
  placeId: string;
}

export interface WebSocketResponse {
  type: 'subscribed' | 'unsubscribed' | 'review.new' | 'review.error';
  data?: AnalyzedReviewUpdate | { message: string };
  placeId?: string;
}

export interface WebSocketClient extends WebSocket {
  isAlive: boolean;
  subscribedPlaces: Set<string>;
}

export interface CollectorDependencies {
  redis: Redis;
  analyzer: SentimentAnalyzer;
}