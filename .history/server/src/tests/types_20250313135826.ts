import { TextSearchResponseData, PlaceDetailsResponseData } from '@googlemaps/google-maps-services-js';

export interface MockApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: Record<string, unknown>;
}

export type MockTextSearchResponse = MockApiResponse<TextSearchResponseData>;
export type MockPlaceDetailsResponse = MockApiResponse<PlaceDetailsResponseData>;

export const createMockResponse = <T>(data: T): MockApiResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {
    'content-type': 'application/json',
  },
  config: {
    url: 'https://maps.googleapis.com/maps/api/place',
    method: 'GET',
  },
});