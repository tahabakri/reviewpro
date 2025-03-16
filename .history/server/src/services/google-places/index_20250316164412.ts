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
    console.info(`Searching places with query: ${query}`);
    
    try {
      if (!query.trim()) {
        console.warn('Empty search query received');
        throw new Error('Search query cannot be empty');
      }

      const response = await axios.get<{ results: GooglePlacesAPIPlace[]; status: string; error_message?: string }>(
        `${this.baseUrl}/textsearch/json`,
        {
          params: {
            query,
            key: this.apiKey,
          },
          validateStatus: status => true // Don't throw on any status
        }
      );

      console.info(`Google Places API response status: ${response.data.status}`);
      
      if (response.status !== 200) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      if (response.data.status !== 'OK') {
        const errorMessage = response.data.error_message || `API Error - Status: ${response.data.status}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (!response.data.results || !Array.isArray(response.data.results)) {
        console.error('Invalid API response format - missing or invalid results array');
        throw new Error('Invalid API response format');
      }

      if (response.data.results.length === 0) {
        console.info('No results found for query');
        return [];
      }

      console.info(`Found ${response.data.results.length} places`);
      
      return response.data.results.map((place) => ({
        name: place.name,
        rating: place.rating || 0,
        reviewCount: place.user_ratings_total || 0,
        location: place.formatted_address,
        placeId: place.place_id,
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API request failed:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        throw new Error(`Failed to search places: ${error.response?.data?.error_message || error.message}`);
      }
      console.error('Error searching places:', error);
      throw new Error('Failed to search places');
    }
  }

  async getPlaceDetails(placeId: string): Promise<GooglePlacesData> {
    try {
      const response = await axios.get<GooglePlacesAPIDetailsResponse & { status: string; error_message?: string }>(
        `${this.baseUrl}/details/json`,
        {
          params: {
            place_id: placeId,
            fields: 'rating,user_ratings_total,reviews',
            key: this.apiKey,
          },
          validateStatus: status => true // Don't throw on any status
        }
      );

      if (response.status !== 200) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      if (response.data.status !== 'OK') {
        const errorMessage = response.data.error_message || `API Error - Status: ${response.data.status}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (!response.data.result) {
        throw new Error('Place details not found');
      }

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
