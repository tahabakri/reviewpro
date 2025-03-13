import { GooglePlacesService } from '../../services/data-collection/google-places';
import { DataCollectionError } from '../../services/data-collection/base';
import { 
  Client, 
  PlaceDetailsResponse, 
  TextSearchResponse,
  Status,
  PlaceType1,
  LatLngBounds
} from '@googlemaps/google-maps-services-js';

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
      const mockResponse: TextSearchResponse = {
        data: {
          status: Status.OK,
          results: [
            {
              place_id: 'test_id_1',
              name: 'Test Business 1',
              formatted_address: '123 Test St',
              rating: 4.5,
              user_ratings_total: 100,
              geometry: {
                location: {
                  lat: 40.7128,
                  lng: -74.0060,
                },
                viewport: {
                  northeast: { lat: 41, lng: -73 },
                  southwest: { lat: 40, lng: -75 },
                } as LatLngBounds,
              },
              types: [PlaceType1.restaurant, PlaceType1.food],
            },
          ],
          html_attributions: [],
          next_page_token: '',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
          url: '',
          method: 'GET',
        },
      };

      mockClient.textSearch.mockResolvedValueOnce(mockResponse);

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
          types: [PlaceType1.restaurant, PlaceType1.food],
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
      const mockResponse: PlaceDetailsResponse = {
        data: {
          status: Status.OK,
          result: {
            place_id: 'test_place_id',
            name: 'Test Place',
            reviews: [
              {
                rating: 5,
                text: 'Great place!',
                time: '1615482000',
                author_name: 'Test User',
                language: 'en',
                profile_photo_url: 'http://example.com/photo.jpg',
                relative_time_description: '',
                author_url: '',
              },
            ],
          },
          html_attributions: [],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
          url: '',
          method: 'GET',
        },
      };

      mockClient.placeDetails.mockResolvedValueOnce(mockResponse);

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
      const mockResponse: PlaceDetailsResponse = {
        data: {
          status: Status.OK,
          result: {
            place_id: 'test_place_id',
            name: 'Test Place',
          },
          html_attributions: [],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
          url: '',
          method: 'GET',
        },
      };

      mockClient.placeDetails.mockResolvedValueOnce(mockResponse);

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