import { Review } from '../types/reviews';
import { SentimentResult } from '../types/sentiment';
import type { Redis } from 'ioredis';
import { WebSocket as WS, Server as WSServer } from 'ws';
import { Mock, SpyInstance } from 'jest-mock';

// Redis mock types
type RedisMockFn = Mock<Promise<any>>;

export interface MockRedisInstance extends Redis {
  get: RedisMockFn;
  set: RedisMockFn;
  del: RedisMockFn;
  keys: RedisMockFn;
  quit: RedisMockFn;
  on: RedisMockFn;
  connect: RedisMockFn;
  disconnect: RedisMockFn;
  setex: RedisMockFn;
  sadd: RedisMockFn;
  smembers: RedisMockFn;
  srem: RedisMockFn;
}

// WebSocket mock types
export interface MockWebSocket extends WS {
  on: Mock;
  send: Mock;
  close: Mock;
  terminate: Mock;
}

export interface MockWebSocketServer extends WSServer {
  on: Mock;
  clients: Set<MockWebSocket>;
  close: Mock;
}

// Review types
export interface MockReview extends Review {
  placeId: string;
  reviewId: string;
  author: {
    name: string;
    profileUrl?: string;
    imageUrl?: string;
  };
  rating: number;
  text: string;
  time: number;
  language: string;
  source: 'google' | 'yelp' | 'tripadvisor';
}

// Sentiment types
export interface MockSentiment extends SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  keyPhrases: string[];
  emotionalTone: string;
}

// Nodemailer types
export interface MockMailResponse {
  messageId: string;
}

export interface MockNodeMailerTransport {
  sendMail: Mock<Promise<MockMailResponse>>;
  verify: Mock<Promise<boolean>>;
}

// Console mock types
export interface MockConsole {
  log: SpyInstance;
  error: SpyInstance;
  warn: SpyInstance;
  info: SpyInstance;
}

// Helper types for mock functions
export type MockPromiseFunction<T> = Mock<Promise<T>>;
export type MockFunction<T = void> = Mock<T>;

// Jest mock return types
export const createMockReturnValue = <T>(value: T): Promise<T> => Promise.resolve(value);
export const createMockRejection = (error: Error): Promise<never> => Promise.reject(error);

// Redis mock responses
export const RedisMockResponses = {
  OK: 'OK',
  NULL: null,
  ONE: 1,
  ZERO: 0,
  EMPTY_ARRAY: [],
} as const;