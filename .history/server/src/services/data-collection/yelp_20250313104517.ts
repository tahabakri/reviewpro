import axios from 'axios';
import { DataCollectionService, DataCollectionError, RateLimiter, CompetitorData, ReviewData } from './base';
import { config } from '../../config';

interface YelpBusiness {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  location: {
    address1?: string;
    city: string;
    state: string;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  categories: Array<{
    alias: string;
    title: string;
  }>;
}

interface YelpReview {
  id: string;
  rating: number;
  text: string;
  time_created: string;
  user: {
    name: string;
    image_url?: string;
  };
}

export class YelpService extends DataCollectionService {
  readonly platform = 'yelp';
  private rateLimiter: RateLimiter;
  private axiosInstance;

  constructor() {
    super();
    this.rateLimiter = new RateLimiter({
      requestsPerSecond: 5,
      maxRetries: 3,
      retryDelay: 1000,
    });

    this.axiosInstance = axios.create({
      baseURL: 'https://api.yelp.com/v3',
      headers: {
        Authorization: `Bearer ${config.apis.yelp.apiKey}`,
        Accept: 'application/json',
      },
    });
  }

  async searchCompetitors(query: string, location: string): Promise<CompetitorData[]> {
    try {
      const response = await this.rateLimiter.execute(async () =>
        this.axiosInstance.get('/businesses/search', {
          params: {
            term: query,
            location: location,
            limit: 20,
          },
        })
      );

      return response.data.businesses.map((business: YelpBusiness) => ({
        name: business.name,
        platform: this.platform,
        externalId: business.id,
        metadata: {
          rating: business.rating,
          reviewCount: business.review_count,
          address: business.location.address1,
          city: business.location.city,
          state: business.location.state,
          coordinates: business.coordinates,
          categories: business.categories.map(cat => cat.title),
        },
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new DataCollectionError(
          `Yelp API error: ${error.response?.data?.error?.description || error.message}`,
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

  async getReviews(businessId: string): Promise<ReviewData[]> {
    try {
      const response = await this.rateLimiter.execute(async () =>
        this.axiosInstance.get(`/businesses/${businessId}/reviews`)
      );

      return response.data.reviews.map((review: YelpReview) => ({
        id: this.generateId(this.platform, review.id),
        rating: review.rating,
        content: review.text,
        platform: this.platform,
        created_at: review.time_created,
        metadata: {
          authorName: review.user.name,
          authorImage: review.user.image_url,
        },
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new DataCollectionError(
          `Yelp API error: ${error.response?.data?.error?.description || error.message}`,
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