import { DataCollectionService } from './base';
import axios from 'axios';
import { Review } from '../../types/reviews';

export class YelpService extends DataCollectionService {
  private apiKey: string;
  
  constructor() {
    super('yelp');
    this.apiKey = process.env.YELP_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('YELP_API_KEY not set in environment variables');
    }
  }
  
  async searchCompetitors(query: string, location: string) {
    try {
      const response = await axios.get(
        'https://api.yelp.com/v3/businesses/search',
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          },
          params: {
            term: query,
            location: location,
            limit: 10
          }
        }
      );
      
      return response.data.businesses || [];
    } catch (error) {
      console.error('Error searching Yelp competitors:', error);
      return [];
    }
  }
  
  async getReviews(businessId: string): Promise<Review[]> {
    try {
      const response = await axios.get(
        `https://api.yelp.com/v3/businesses/${businessId}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data.reviews.map((review: any) => ({
        id: review.id,
        author: review.user.name,
        text: review.text,
        rating: review.rating,
        date: this.formatDate(review.time_created),
        source: 'yelp',
        sourceId: businessId
      }));
    } catch (error) {
      console.error('Error fetching Yelp reviews:', error);
      return [];
    }
  }
  
  formatDate(dateString: string): Date {
    return new Date(dateString);
  }
}

// Export singleton instance
export const yelpService = new YelpService();