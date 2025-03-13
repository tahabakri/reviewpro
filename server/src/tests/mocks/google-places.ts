import { Status, PlaceType1 } from '@googlemaps/google-maps-services-js';

const defaultAxiosConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  url: 'https://maps.googleapis.com/maps/api/place',
  method: 'GET',
  baseURL: '',
  transformRequest: [],
  transformResponse: [],
  timeout: 0,
  xsrfCookieName: '',
  xsrfHeaderName: '',
  maxContentLength: -1,
  maxBodyLength: -1,
  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false,
  },
  signal: null,
  env: {
    FormData: undefined,
  },
  decompress: true,
} as const;

export const mockSearchResponse = {
  data: {
    status: Status.OK,
    error_message: '',
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
          },
        },
        types: [PlaceType1.restaurant],
      },
    ],
    html_attributions: [],
    next_page_token: '',
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: defaultAxiosConfig,
};

export const mockDetailsResponse = {
  data: {
    status: Status.OK,
    error_message: '',
    result: {
      place_id: 'test_place_id',
      name: 'Test Place',
      formatted_address: '',
      reviews: [
        {
          rating: 5,
          text: 'Great place!',
          time: '1615482000',
          author_name: 'Test User',
          language: 'en',
          profile_photo_url: 'http://example.com/photo.jpg',
          relative_time_description: 'a week ago',
          author_url: 'http://example.com/author',
          aspects: [],
        },
      ],
      types: [],
      url: '',
      utc_offset: 0,
      website: '',
      geometry: {
        location: { lat: 0, lng: 0 },
        viewport: {
          northeast: { lat: 0, lng: 0 },
          southwest: { lat: 0, lng: 0 },
        },
      },
    },
    html_attributions: [],
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: defaultAxiosConfig,
};

export const mockEmptyDetailsResponse = {
  data: {
    status: Status.OK,
    error_message: '',
    result: {
      place_id: 'test_place_id',
      name: 'Test Place',
      formatted_address: '',
      types: [],
      url: '',
      utc_offset: 0,
      website: '',
      geometry: {
        location: { lat: 0, lng: 0 },
        viewport: {
          northeast: { lat: 0, lng: 0 },
          southwest: { lat: 0, lng: 0 },
        },
      },
    },
    html_attributions: [],
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: defaultAxiosConfig,
};