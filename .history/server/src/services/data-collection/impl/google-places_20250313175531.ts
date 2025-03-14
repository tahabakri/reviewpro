import { DataCollectionService, DataCollectionError, ReviewData } from '../base';
import { config } from '../../../config';
import { Client as GoogleMapsClient, Status } from '@googlemaps/google-maps-services-js';
import { CompetitorData } from '../../../types';
import { v4 as uuidv4 } from 'uuid';

export class GooglePlacesService extends DataCollectionService {
  private client: GoogleMapsClient;
  readonly platform = 'google';

  constructor() {
    super();
    this.client = new GoogleMapsClient({});
  }

  async searchCompetitors(query: string, location: string): Promise<CompetitorData[]> {
    try {
      const response = await this.client.textSearch({
        params: {
          query: `${query} near ${location}`,
          key: config.apis.google.placesApiKey,
        },
      });

      if (response.data.status !== Status.OK) {
        throw new Error(`Google Places API error: ${response.data.error_message}`);
      }

      return response.data.results.map(place => ({
        name: place.name || '',
        platform: this.platform,
        externalId: place.place_id || '',
        metadata: {
          address: place.formatted_address,
          location: place.geometry?.location,
          rating: place.rating,
          totalRatings: place.user_ratings_total,
          types: place.types,
        },
      }));
    } catch (error) {
      throw new DataCollectionError(
        `Failed to search competitors: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.platform
      );
    }
  }

  async getReviews(placeId: string): Promise<ReviewData[]> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          key: config.apis.google.placesApiKey,
          fields: ['reviews', 'name'],
        },
      });

      if (response.data.status !== Status.OK) {
        throw new Error(`Google Places API error: ${response.data.error_message}`);
      }

      const reviews = response.data.result.reviews || [];
      return reviews.map(review => ({
        id: this.generateId(this.platform, review.time),
        rating: review.rating,
        content: review.text,
        platform: this.platform,
        created_at: this.formatDate(review.time),
        metadata: {
          authorName: review.author_name,
          language: review.language,
          profilePhoto: review.profile_photo_url,
        },
      }));
    } catch (error) {
      throw new DataCollectionError(
        `Failed to get reviews: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.platform
      );
    }
  }

  protected generateId(prefix: string, timestamp: string | number): string {
    return `${prefix}_${timestamp}_${uuidv4()}`;
  }

  protected formatDate(timestamp: string | number): string {
    return new Date(Number(timestamp) * 1000).toISOString();
  }
}