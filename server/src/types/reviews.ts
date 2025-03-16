export interface Review {
  placeId: string;
  reviewId: string;
  author: {
    name: string;
    profileUrl?: string;
    imageUrl?: string;
  };
  rating: number;
  text: string;
  time: number;
  language: string;
  likes?: number;
  replyText?: string;
  replyTime?: number;
  source: 'google' | 'yelp' | 'tripadvisor';
  url?: string;
  photos?: string[];
  tags?: string[];
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
}

export interface ReviewUpdate extends Review {
  updateType: 'new' | 'edit' | 'delete';
  previousVersion?: Review;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: number;
  };
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topTags: Array<{
    tag: string;
    count: number;
  }>;
  recentTrend: {
    period: string;
    rating: number;
    sentiment: number;
    volume: number;
  }[];
}

export interface ReviewFilter {
  rating?: number[];
  sentiment?: ('positive' | 'negative' | 'neutral')[];
  dateRange?: {
    start: number;
    end: number;
  };
  tags?: string[];
  source?: ('google' | 'yelp' | 'tripadvisor')[];
  hasReply?: boolean;
  hasPhotos?: boolean;
  sortBy?: 'time' | 'rating' | 'likes' | 'sentiment';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}