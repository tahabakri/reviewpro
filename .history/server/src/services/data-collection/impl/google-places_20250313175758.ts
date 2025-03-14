import { BaseDataCollector, DataCollectionError } from '../base';
import { CompetitorData, ReviewData } from '../../../types';
import { config } from '../../../config';
import { Client as GoogleMapsClient, Status } from '@googlemaps/google-maps-services-js';

export class GooglePlacesService extends BaseDataCollector {
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
        metadata: this.ensureMetadata({
          address: place.formatted_address,
          location: place.geometry?.location,
          rating: place.rating,
          totalRatings: place.user_ratings_total,
          types: place.types,
        }),
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
        created_at: this.formatDate(new Date(Number(review.time) * 1000)),
        metadata: this.ensureMetadata({
          authorName: review.author_name,
          language: review.language,
          profilePhoto: review.profile_photo_url,
        }),
      }));
    } catch (error) {
      throw new DataCollectionError(
        `Failed to get reviews: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.platform
      );
    }
  }
}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();