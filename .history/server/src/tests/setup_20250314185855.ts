import { jest } from '@jest/globals';
import dotenv from 'dotenv';
import { Redis } from 'ioredis';
import type { MockReview, MockSentiment, MockRedis, MockWebSocket, MockNodeMailerTransport } from './types';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock Redis
jest.mock('ioredis', () => {
  const RedisMock = jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    quit: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    setex: jest.fn().mockResolvedValue('OK'),
    sadd: jest.fn().mockResolvedValue(1),
    smembers: jest.fn().mockResolvedValue([]),
    srem: jest.fn().mockResolvedValue(1)
  }));

  return RedisMock;
});

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue<MockNodeMailerTransport>({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
    verify: jest.fn().mockResolvedValue(true)
  })
}));

// Mock WebSocket
jest.mock('ws', () => {
  const WebSocketMock = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    terminate: jest.fn()
  })) as jest.MockedFunction<typeof WebSocket> & {
    Server: jest.MockedFunction<typeof WebSocket.Server>;
  };

  WebSocketMock.Server = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    clients: new Set<MockWebSocket>(),
    close: jest.fn()
  }));

  return WebSocketMock;
});

// Set up global test environment
beforeAll(() => {
  // Set required environment variables for tests
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.GEMINI_API_KEY = 'test-api-key';
  process.env.EMAIL_HOST = 'smtp.test.com';
  process.env.EMAIL_PORT = '587';
  process.env.EMAIL_USER = 'test@test.com';
  process.env.EMAIL_PASS = 'test-password';
  process.env.EMAIL_FROM = 'test@test.com';
  process.env.JWT_SECRET = 'test-secret';
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks();
});

// Global test utilities
export const createMockRedis = (): MockRedis => {
  return new Redis() as unknown as MockRedis;
};

export const mockConsole = (): void => {
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  };
};

export const mockTimers = (): void => {
  jest.useFakeTimers();
};

export const advanceTimersByTime = (ms: number): void => {
  jest.advanceTimersByTime(ms);
};

export const restoreTimers = (): void => {
  jest.useRealTimers();
};

export const waitForPromises = async (): Promise<void> => {
  await Promise.resolve();
  jest.runAllTimers();
  await Promise.resolve();
};

// Test data generators
export const generateMockReview = (overrides: Partial<MockReview> = {}): MockReview => ({
  placeId: 'test-place',
  reviewId: 'test-review-1',
  author: {
    name: 'Test User',
    profileUrl: 'https://test.com/user',
  },
  rating: 4,
  text: 'Great experience!',
  time: Date.now(),
  language: 'en',
  source: 'google',
  ...overrides
});

export const generateMockSentiment = (overrides: Partial<MockSentiment> = {}): MockSentiment => ({
  sentiment: 'positive',
  score: 0.8,
  keyPhrases: ['great', 'experience'],
  emotionalTone: 'satisfaction',
  ...overrides
});