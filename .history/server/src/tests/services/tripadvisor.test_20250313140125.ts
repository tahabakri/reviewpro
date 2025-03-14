import { TripAdvisorService } from '../../services/data-collection/tripadvisor';
import { DataCollectionError } from '../../services/data-collection/base';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TripAdvisorService', () => {
  let service: TripAdvisorService;

  beforeEach(() => {
    service = new TripAdvisorService();
  });

  describe('searchCompetitors', () => {
    it('should return formatted competitor data', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              location_id: 'test-id-1',
              name: 'Test Business 1',
              rating: 4.5,
              num_reviews: 100,
              location_string: 'Test City, TS, USA',
              address_obj: {
                street1: '123 Test St',
                city: 'Test City',
                state: 'TS',
                country: 'USA',
              },
              latitude: 40.7128,
              longitude: -74.0060,
              category: {
                key: 'restaurant',
                name: 'Restaurant',
              },
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.searchCompetitors('restaurant', 'New York');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Test Business 1',
        platform: 'tripadvisor',
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
          category: 'Restaurant',
          locationString: 'Test City, TS, USA',
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
          data: [
            {
              id: 'review-1',
              rating: 5,
              text: 'Great place!',
              published_date: '2023-01-01T10:00:00',
              trip_type: 'business',
              user: {
                username: 'Test User',
                avatar: {
                  small: 'http://example.com/photo-small.jpg',
                  large: 'http://example.com/photo-large.jpg',
                },
              },
              subratings: {
                food: 5,
                service: 4,
                atmosphere: 5,
              },
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getReviews('test-location-id');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        rating: 5,
        content: 'Great place!',
        platform: 'tripadvisor',
        metadata: {
          authorName: 'Test User',
          authorImage: 'http://example.com/photo-small.jpg',
          tripType: 'business',
          subratings: {
            food: 5,
            service: 4,
            atmosphere: 5,
          },
        },
      });
      expect(result[0].id).toBeDefined();
      expect(result[0].created_at).toBeDefined();
    });

    it('should handle missing reviews', async () => {
      const mockResponse = {
        data: {
          data: [],
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await service.getReviews('test-location-id');
      expect(result).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getReviews('test-location-id'))
        .rejects
        .toThrow(DataCollectionError);
    });
  });
});