import type { Redis } from 'ioredis';
import type { WebSocket as WS, Server as WSServer } from 'ws';
import type { JestMock, SpyInstance } from '@jest/globals';

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
type RedisEventFn = (event: string, listener: (...args: unknown[]) => void) => void;
type RedisConnectFn = () => Promise<void>;
type RedisDisconnectFn = () => void;

// Redis mock instance
export interface MockRedisInstance extends Omit<Redis, keyof Redis> {
  get: JestMock<[key: string], Promise<string | null>>;
  set: JestMock<[key: string, value: string], Promise<'OK'>>;
  del: JestMock<[key: string], Promise<number>>;
  keys: JestMock<[pattern: string], Promise<string[]>>;
  quit: JestMock<[], Promise<'OK'>>;
  setex: JestMock<[key: string, seconds: number, value: string], Promise<'OK'>>;
  sadd: JestMock<[key: string, ...members: string[]], Promise<number>>;
  srem: JestMock<[key: string, ...members: string[]], Promise<number>>;
  smembers: JestMock<[key: string], Promise<string[]>>;
  on: JestMock<[event: string, listener: (...args: unknown[]) => void], void>;
  connect: JestMock<[], Promise<void>>;
  disconnect: JestMock<[], void>;
}

// WebSocket event handlers
type WSMessageHandler = (data: Buffer | string) => void;
type WSCloseHandler = () => void;
type WSErrorHandler = (error: Error) => void;

// WebSocket mock types
export interface MockWebSocket extends Omit<WS, keyof WS> {
  on: JestMock<[event: 'message' | 'close' | 'error', listener: WSMessageHandler | WSCloseHandler | WSErrorHandler], void>;
  send: JestMock<[data: string | Buffer], void>;
  close: JestMock<[], void>;
  terminate: JestMock<[], void>;
}

export interface MockWebSocketServer extends Omit<WSServer, keyof WSServer> {
  on: JestMock<[event: string, listener: (socket: MockWebSocket) => void], void>;
  clients: Set<MockWebSocket>;
  close: JestMock<[], void>;
}

// Mail types
export interface MockMailResponse {
  messageId: string;
}

type MailSendFn = (options: Record<string, unknown>) => Promise<MockMailResponse>;
type MailVerifyFn = () => Promise<boolean>;

export interface MockNodeMailerTransport {
  sendMail: JestMock<[options: Record<string, unknown>], Promise<MockMailResponse>>;
  verify: JestMock<[], Promise<boolean>>;
}

// Console mock types
export interface MockConsole {
  log: SpyInstance<[...args: unknown[]], void>;
  error: SpyInstance<[...args: unknown[]], void>;
  warn: SpyInstance<[...args: unknown[]], void>;
  info: SpyInstance<[...args: unknown[]], void>;
}

// Review mock type
export interface MockReview {
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

// Sentiment mock type
export interface MockSentiment {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  keyPhrases: string[];
  emotionalTone: string;
}

// Redis mock responses
export const RedisMockResponses = {
  OK: 'OK',
  NULL: null,
  ONE: 1,
  ZERO: 0,
  EMPTY_ARRAY: [],
} as const;