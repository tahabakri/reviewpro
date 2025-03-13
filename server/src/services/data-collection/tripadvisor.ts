import axios from 'axios';
import { DataCollectionService, DataCollectionError, RateLimiter, CompetitorData, ReviewData } from './base';
import { config } from '../../config';

interface TripAdvisorLocation {
  location_id: string;
  name: string;
  rating: number;
  num_reviews: number;
  location_string: string;
  address_obj: {
    street1?: string;
    city: string;
    state?: string;
    country: string;
  };
  latitude: number;
  longitude: number;
  category: {
    key: string;
    name: string;
  };
}

interface TripAdvisorReview {
  id: string;
  rating: number;
  text: string;
  published_date: string;
  trip_type: string;
  user: {
    username: string;
    avatar?: {
      small: string;
      large: string;
    };
  };
  subratings?: {
    [key: string]: number;
  };
}

export class TripAdvisorService extends DataCollectionService {
  readonly platform = 'tripadvisor';
  private rateLimiter: RateLimiter;
  private axiosInstance;

  constructor() {
    super();
    this.rateLimiter = new RateLimiter({
      requestsPerSecond: 3,
      maxRetries: 3,
      retryDelay: 1500,
    });

    this.axiosInstance = axios.create({
      baseURL: 'https://api.content.tripadvisor.com/api/v1',
      headers: {
        'Accept': 'application/json',
        'X-TripAdvisor-API-Key': config.apis.tripadvisor.apiKey,
      },
    });
  }

  async searchCompetitors(query: string, location: string): Promise<CompetitorData[]> {
    try {
      const response = await this.rateLimiter.execute(async () =>
        this.axiosInstance.get('/locations/search', {
          params: {
            searchQuery: `${query} ${location}`,
            category: 'restaurants,hotels,attractions',
            language: 'en',
          },
        })
      );

      return response.data.data.map((location: TripAdvisorLocation) => ({
        name: location.name,
        platform: this.platform,
        externalId: location.location_id,
        metadata: {
          rating: location.rating,
          reviewCount: location.num_reviews,
          address: location.address_obj.street1,
          city: location.address_obj.city,
          state: location.address_obj.state,
          coordinates: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          category: location.category.name,
          locationString: location.location_string,
        },
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new DataCollectionError(
          `TripAdvisor API error: ${error.response?.data?.message || error.message}`,
          this.platform,
          error.response?.status?.toString()
        );
      }
      throw new DataCollectionError(
        `Failed to search competitors: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.platform
      );
    }
  }

  async getReviews(locationId: string): Promise<ReviewData[]> {
    try {
      const response = await this.rateLimiter.execute(async () =>
        this.axiosInstance.get(`/location/${locationId}/reviews`, {
          params: {
            language: 'en',
            limit: 100,
          },
        })
      );

      return response.data.data.map((review: TripAdvisorReview) => ({
        id: this.generateId(this.platform, review.id),
        rating: review.rating,
        content: review.text,
        platform: this.platform,
        created_at: review.published_date,
        metadata: {
          authorName: review.user.username,
          authorImage: review.user.avatar?.small,
          tripType: review.trip_type,
          subratings: review.subratings,
        },
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new DataCollectionError(
          `TripAdvisor API error: ${error.response?.data?.message || error.message}`,
          this.platform,
          error.response?.status?.toString()
        );
      }
      throw new DataCollectionError(
        `Failed to fetch reviews: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.platform
      );
    }
  }
}