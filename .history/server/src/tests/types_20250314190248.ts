import type { Review } from '../types/reviews';
import type { SentimentResult } from '../types/sentiment';
import type { Redis } from 'ioredis';
import type { WebSocket as WS, Server as WSServer } from 'ws';
import type { Mock, SpyInstance } from '@jest/globals';

// Function signatures for Redis methods
type RedisGetFn = (key: string) => Promise<string | null>;
type RedisSetFn = (key: string, value: string) => Promise<'OK'>;
type RedisDelFn = (key: string) => Promise<number>;
type RedisKeysFn = (pattern: string) => Promise<string[]>;
type RedisQuitFn = () => Promise<'OK'>;
type RedisSetexFn = (key: string, seconds: number, value: string) => Promise<'OK'>;
type RedisSaddFn = (key: string, ...members: string[]) => Promise<number>;
type RedisSremFn = (key: string, ...members: string[]) => Promise<number>;
type RedisSMembersFn = (key: string) => Promise<string[]>;

// Redis mock instance type
export interface MockRedisInstance extends Omit<Redis, keyof Redis> {
  get: Mock<ReturnType<RedisGetFn>, Parameters<RedisGetFn>>;
  set: Mock<ReturnType<RedisSetFn>, Parameters<RedisSetFn>>;
  del: Mock<ReturnType<RedisDelFn>, Parameters<RedisDelFn>>;
  keys: Mock<ReturnType<RedisKeysFn>, Parameters<RedisKeysFn>>;
  quit: Mock<ReturnType<RedisQuitFn>, Parameters<RedisQuitFn>>;
  setex: Mock<ReturnType<RedisSetexFn>, Parameters<RedisSetexFn>>;
  sadd: Mock<ReturnType<RedisSaddFn>, Parameters<RedisSaddFn>>;
  srem: Mock<ReturnType<RedisSremFn>, Parameters<RedisSremFn>>;
  smembers: Mock<ReturnType<RedisSMembersFn>, Parameters<RedisSMembersFn>>;
  on: Mock<void, [event: string, listener: (...args: any[]) => void]>;
  connect: Mock<Promise<void>, []>;
  disconnect: Mock<void, []>;
}

// WebSocket event types
type WSEventMap = {
  message: (data: Buffer) => void;
  close: () => void;
  error: (error: Error) => void;
};

// WebSocket mock types
export interface MockWebSocket extends Omit<WS, keyof WS> {
  on: Mock<MockWebSocket, [event: keyof WSEventMap, listener: WSEventMap[keyof WSEventMap]]>;
  send: Mock<void, [data: string | Buffer]>;
  close: Mock<void, []>;
  terminate: Mock<void, []>;
}

export interface MockWebSocketServer extends Omit<WSServer, keyof WSServer> {
  on: Mock<MockWebSocketServer, [event: string, listener: (socket: MockWebSocket) => void]>;
  clients: Set<MockWebSocket>;
  close: Mock<void, []>;
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
  sendMail: Mock<Promise<MockMailResponse>, [options: Record<string, unknown>]>;
  verify: Mock<Promise<boolean>, []>;
}

// Console mock types
export interface MockConsole {
  log: SpyInstance;
  error: SpyInstance;
  warn: SpyInstance;
  info: SpyInstance;
}

// Redis mock responses
export const RedisMockResponses = {
  OK: 'OK',
  NULL: null,
  ONE: 1,
  ZERO: 0,
  EMPTY_ARRAY: [],
} as const;

// Helper types for creating mocks
export type MockResponse<T> = {
  success: T;
  error: Error;
};