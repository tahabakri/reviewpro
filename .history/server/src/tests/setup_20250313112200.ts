import { jest } from '@jest/globals';
import { config } from '../config';

// Mock Redis client
jest.mock('../config', () => ({
  ...jest.requireActual('../config'),
  redisClient: {
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}));

// Mock external APIs
jest.mock('axios');

// Test environment configuration
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(async () => {
  // Add any global setup needed
});

// Global test teardown
afterAll(async () => {
  // Add any global cleanup needed
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

export {};