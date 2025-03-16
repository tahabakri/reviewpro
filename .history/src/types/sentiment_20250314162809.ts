export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  keyPhrases: string[];
  emotionalTone: string;
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

export interface SentimentStats {
  positive: number;
  negative: number;
  neutral: number;
  averageScore: number;
  totalReviews: number;
  topPhrases: Array<{
    text: string;
    frequency: number;
    sentiment: string;
  }>;
}

export interface TimelineData {
  date: string;
  value: number;
  volume: number;
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