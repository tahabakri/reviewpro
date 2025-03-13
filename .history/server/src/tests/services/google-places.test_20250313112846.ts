import { GooglePlacesService } from '../../services/data-collection/google-places';
import { DataCollectionError } from '../../services/data-collection/base';
import { Client, PlaceType1 } from '@googlemaps/google-maps-services-js';
import { 
  mockSearchResponse, 
  mockDetailsResponse, 
  mockEmptyDetailsResponse 
} from '../mocks/google-places';

jest.mock('@googlemaps/google-maps-services-js');
const MockedClient = Client as jest.MockedClass<typeof Client>;

describe('GooglePlacesService', () => {
  let service: GooglePlacesService;
  let mockClient: jest.Mocked<Pick<Client, 'textSearch' | 'placeDetails'>>;

  beforeEach(() => {
    mockClient = {
      textSearch: jest.fn(),
      placeDetails: jest.fn(),
    };

    MockedClient.prototype.textSearch = mockClient.textSearch;
    MockedClient.prototype.placeDetails = mockClient.placeDetails;

    service = new GooglePlacesService();
  });

  describe('searchCompetitors', () => {
    it('should return formatted competitor data', async () => {
      mockClient.textSearch.mockResolvedValueOnce(mockSearchResponse as any);

      const result = await service.searchCompetitors('restaurant', 'New York');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Test Business 1',
        platform: 'google',
        externalId: 'test_id_1',
        metadata: {
          address: '123 Test St',
          location: {
            lat: 40.7128,
            lng: -74.0060,
          },
          rating: 4.5,
          totalRatings: 100,
          types: [PlaceType1.restaurant],
        },
      });
    });

    it('should handle API errors', async () => {
      mockClient.textSearch.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.searchCompetitors('restaurant', 'New York'))
        .rejects
        .toThrow(DataCollectionError);
    });
  });

  describe('getReviews', () => {
    it('should return formatted review data', async () => {
      mockClient.placeDetails.mockResolvedValueOnce(mockDetailsResponse);

      const result = await service.getReviews('test_place_id');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        rating: 5,
        content: 'Great place!',
        platform: 'google',
        metadata: {
          authorName: 'Test User',
          language: 'en',
          profilePhoto: 'http://example.com/photo.jpg',
        },
      });
      expect(result[0].id).toBeDefined();
      expect(result[0].created_at).toBeDefined();
    });

    it('should handle missing reviews', async () => {
      mockClient.placeDetails.mockResolvedValueOnce(mockEmptyDetailsResponse);

      const result = await service.getReviews('test_place_id');
      expect(result).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      mockClient.placeDetails.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getReviews('test_place_id'))
        .rejects
        .toThrow(DataCollectionError);
    });
  });
});