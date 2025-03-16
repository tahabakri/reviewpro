import axios from 'axios';

interface GooglePlacesAPIPlace {
  name: string;
  rating?: number;
  user_ratings_total?: number;
  formatted_address: string;
  place_id: string;
}

interface GooglePlacesAPIReview {
  rating: number;
  text: string;
  time: number;
  author_name: string;
}

interface GooglePlacesAPIDetailsResponse {
  result: {
    rating?: number;
    user_ratings_total?: number;
    reviews?: GooglePlacesAPIReview[];
  };
}

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
      console.error('CRITICAL: Google Places API key is missing');
      throw new Error('Google Places API key is required');
    }
    console.info('Google Places Service initialized successfully');
  }

  async searchPlaces(query: string): Promise<GooglePlacesSearchResult[]> {
    try {
      const response = await axios.get<{ results: GooglePlacesAPIPlace[] }>(
        `${this.baseUrl}/textsearch/json`,
        {
          params: {
            query,
            key: this.apiKey,
          },
        }
      );

      return response.data.results.map((place) => ({
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
      const response = await axios.get<GooglePlacesAPIDetailsResponse>(
        `${this.baseUrl}/details/json`,
        {
          params: {
            place_id: placeId,
            fields: 'rating,user_ratings_total,reviews',
            key: this.apiKey,
          },
        }
      );

      const data = response.data.result;
      const reviews = data.reviews || [];

      // Calculate sentiment based on ratings
      const sentimentCounts = reviews.reduce(
        (acc: { positive: number; negative: number; neutral: number }, review: GooglePlacesAPIReview) => {
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