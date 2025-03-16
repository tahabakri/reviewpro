import { GooglePlacesService as BaseGooglePlacesService } from './base/google-places';
import axios from 'axios';

export class GooglePlacesService extends BaseGooglePlacesService {
  apiKey: string;

  constructor() {
    super();
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Google Maps API Key not set');
    }
  }

  async fetchBusinessReviews(placeId: string): Promise<any[]> {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${this.apiKey}`;
    try {
      const response = await axios.get(url);
      const reviews = response.data.result?.reviews || [];
      return reviews;
    } catch (error: any) {
      throw new Error("Failed to fetch reviews: " + error.message);
    }
  }

  analyzeReviews(reviews: any[]): any {
    if (!reviews || reviews.length === 0) return null;
    let total = 0;
    reviews.forEach(review => {
      total += review.rating;
    });
    const averageRating = total / reviews.length;
    const sentiments = this.simpleSentimentAnalysis(reviews);
    return {
      averageRating,
      reviewCount: reviews.length,
      sentiments
    };
  }

  simpleSentimentAnalysis(reviews: any[]): any {
    let positive = reviews.filter((review: any) => review.rating >= 4).length;
    let negative = reviews.filter((review: any) => review.rating <= 2).length;
    let neutral = reviews.length - positive - negative;
    return { positive, negative, neutral };
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();