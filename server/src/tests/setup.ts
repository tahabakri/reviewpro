import { createClient } from '@supabase/supabase-js';

// Mock Redis client
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
  })),
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
  // Any global setup needed for tests
});

// Global test teardown
afterAll(async () => {
  // Any global cleanup needed
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

export const mockSupabaseClient = createClient('test', 'test');