import { GooglePlacesService as BaseGooglePlacesService } from './base/google-places';
import axios from 'axios';

interface Review {
  rating: number;
  text: string;
  time: number;
  author_name: string;
  relative_time_description: string;
}

interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
}

interface AnalysisResult {
  averageRating: number;
  reviewCount: number;
  sentiments: SentimentAnalysis;
}

export class GooglePlacesService extends BaseGooglePlacesService {
  apiKey: string;

  constructor() {
    super();
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Google Maps API Key not set');
    }
  }

  async fetchBusinessReviews(placeId: string): Promise<Review[]> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${this.apiKey}`;
    try {
      const response = await axios.get(url);
      const reviews: Review[] = response.data.result?.reviews || [];
      return reviews;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error('Failed to fetch reviews: ' + error.message);
      }
      throw new Error('Failed to fetch reviews');
    }
  }

  analyzeReviews(reviews: Review[]): AnalysisResult | null {
    if (reviews.length === 0) return null;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = total / reviews.length;
    const sentiments = this.simpleSentimentAnalysis(reviews);
    return {
      averageRating,
      reviewCount: reviews.length,
      sentiments
    };
  }

  simpleSentimentAnalysis(reviews: Review[]): SentimentAnalysis {
    const positive = reviews.filter(review => review.rating >= 4).length;
    const negative = reviews.filter(review => review.rating <= 2).length;
    const neutral = reviews.length - positive - negative;
    return { positive, negative, neutral };
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();