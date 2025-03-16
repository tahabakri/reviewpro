import axios from 'axios';

interface GooglePlacesSearchResult {
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  placeId: string;
}

interface GooglePlacesData {
  overallRating: number;
  reviewCount: number;
  sentimentAnalysis: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export class GooglePlacesService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Google Places API key is required');
    }
  }

  async searchPlaces(query: string): Promise<GooglePlacesSearchResult[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
        params: {
          query,
          key: this.apiKey,
        },
      });

      return response.data.results.map((place: any) => ({
        name: place.name,
        rating: place.rating || 0,
        reviewCount: place.user_ratings_total || 0,
        location: place.formatted_address,
        placeId: place.place_id,
      }));
    } catch (error) {
      console.error('Error searching places:', error);
      throw new Error('Failed to search places');
    }
  }

  async getPlaceDetails(placeId: string): Promise<GooglePlacesData> {
    try {
      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          fields: 'rating,user_ratings_total,reviews',
          key: this.apiKey,
        },
      });

      const data = response.data.result;
      const reviews = data.reviews || [];

      // Simple sentiment analysis based on rating
      const sentimentCounts = reviews.reduce(
        (acc: { positive: number; negative: number; neutral: number }, review: any) => {
          const rating = review.rating;
          if (rating >= 4) acc.positive++;
          else if (rating <= 2) acc.negative++;
          else acc.neutral++;
          return acc;
        },
        { positive: 0, negative: 0, neutral: 0 }
      );

      const totalReviews = reviews.length;
      const sentimentAnalysis = {
        positive: totalReviews ? sentimentCounts.positive / totalReviews : 0,
        negative: totalReviews ? sentimentCounts.negative / totalReviews : 0,
        neutral: totalReviews ? sentimentCounts.neutral / totalReviews : 0,
      };

      return {
        overallRating: data.rating || 0,
        reviewCount: data.user_ratings_total || 0,
        sentimentAnalysis,
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      throw new Error('Failed to get place details');
    }
  }
}