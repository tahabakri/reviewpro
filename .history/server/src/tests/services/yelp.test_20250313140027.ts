import { YelpService } from '../../services/data-collection/yelp';
import { DataCollectionError } from '../../services/data-collection/base';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('YelpService', () => {
  let service: YelpService;

  beforeEach(() => {
    service = new YelpService();
  });

  describe('searchCompetitors', () => {
    it('should return formatted competitor data', async () => {
      const mockResponse = {
        data: {
          businesses: [
            {
              id: 'test-id-1',
              name: 'Test Business 1',
              rating: 4.5,
              review_count: 100,
              location: {
                address1: '123 Test St',
                city: 'Test City',
                state: 'TS',
                country: 'US',
              },
              coordinates: {
                latitude: 40.7128,
                longitude: -74.0060,
              },
              categories: [
                { alias: 'restaurants', title: 'Restaurants' },
                { alias: 'italian', title: 'Italian' },
              ],
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.searchCompetitors('restaurant', 'New York');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Test Business 1',
        platform: 'yelp',
        externalId: 'test-id-1',
        metadata: {
          rating: 4.5,
          reviewCount: 100,
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
          categories: ['Restaurants', 'Italian'],
        },
      });
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.searchCompetitors('restaurant', 'New York'))
        .rejects
        .toThrow(DataCollectionError);
    });
  });

  describe('getReviews', () => {
    it('should return formatted review data', async () => {
      const mockResponse = {
        data: {
          reviews: [
            {
              id: 'review-1',
              rating: 5,
              text: 'Great place!',
              time_created: '2023-01-01 10:00:00',
              user: {
                name: 'Test User',
                image_url: 'http://example.com/photo.jpg',
              },
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getReviews('test-business-id');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        rating: 5,
        content: 'Great place!',
        platform: 'yelp',
        metadata: {
          authorName: 'Test User',
          authorImage: 'http://example.com/photo.jpg',
        },
      });
      expect(result[0].id).toBeDefined();
      expect(result[0].created_at).toBeDefined();
    });

    it('should handle missing reviews', async () => {
      const mockResponse = {
        data: {
          reviews: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getReviews('test-business-id');
      expect(result).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getReviews('test-business-id'))
        .rejects
        .toThrow(DataCollectionError);
    });
  });
});