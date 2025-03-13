import {
  Client,
  PlaceType2,
  Language,
  TextSearchResponse,
  PlaceDetailsResponse
} from '@googlemaps/google-maps-services-js';
import { DataCollectionService, DataCollectionError, RateLimiter, CompetitorData, ReviewData } from './base';
import { config } from '../../config';

export class GooglePlacesService extends DataCollectionService {
  readonly platform = 'google';
  private client: Client;
  private rateLimiter: RateLimiter;

  constructor() {
    super();
    this.client = new Client({});
    this.rateLimiter = new RateLimiter({
      requestsPerSecond: 10,
      maxRetries: 3,
      retryDelay: 1000,
    });
  }

  async searchCompetitors(query: string, location: string): Promise<CompetitorData[]> {
    try {
      const response = await this.rateLimiter.execute(() =>
        this.client.textSearch({
          params: {
            query: `${query} ${location}`,
            key: config.apis.google.placesApiKey,
            type: 'business' as PlaceType2,
          },
        })
      ) as TextSearchResponse;

      if (response.data.status !== 'OK') {
        throw new DataCollectionError(
          `Google Places API error: ${response.data.status}`,
          this.platform,
          response.data.status
        );
      }

      return response.data.results.map(place => {
        if (!place.name || !place.place_id) {
          throw new DataCollectionError(
            'Invalid place data received from Google Places API',
            this.platform
          );
        }

        return {
          name: place.name,
          platform: this.platform,
          externalId: place.place_id,
          metadata: {
            address: place.formatted_address || undefined,
            location: place.geometry?.location || undefined,
            rating: place.rating || undefined,
            totalRatings: place.user_ratings_total || undefined,
            types: place.types || undefined,
          },
        };
      });
    } catch (error) {
      throw new DataCollectionError(
        `Failed to search competitors: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.platform
      );
    }
  }

  async getReviews(placeId: string): Promise<ReviewData[]> {
    try {
      const response = await this.rateLimiter.execute(() =>
        this.client.placeDetails({
          params: {
            place_id: placeId,
            key: config.apis.google.placesApiKey,
            language: Language.en,
            fields: ['review'],
          },
        })
      );

      if (response.data.status !== 'OK') {
        throw new DataCollectionError(
          `Google Places API error: ${response.data.status}`,
          this.platform,
          response.data.status
        );
      }

      const reviews = response.data.result.reviews || [];
      return reviews.map(review => ({
        id: this.generateId(this.platform, `${placeId}_${review.time}`),
        rating: review.rating,
        content: review.text,
        platform: this.platform,
        created_at: this.formatDate(new Date(review.time * 1000)),
        metadata: {
          authorName: review.author_name,
          language: review.language,
          profilePhoto: review.profile_photo_url,
        },
      }));
    } catch (error) {
      throw new DataCollectionError(
        `Failed to fetch reviews: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.platform
      );
    }
  }

  private validateResponse<T>(response: T | null | undefined, errorMessage: string): asserts response is T {
    if (!response) {
      throw new DataCollectionError(errorMessage, this.platform);
    }
  }
}