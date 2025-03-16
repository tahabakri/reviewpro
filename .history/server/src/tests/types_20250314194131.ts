import type { Redis } from 'ioredis';
import type { WebSocket as WS, Server as WSServer } from 'ws';
import type { MockInstance } from './jest';

// Redis mock function types
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
  get: MockInstance<RedisGetFn>;
  set: MockInstance<RedisSetFn>;
  del: MockInstance<RedisDelFn>;
  keys: MockInstance<RedisKeysFn>;
  quit: MockInstance<RedisQuitFn>;
  setex: MockInstance<RedisSetexFn>;
  sadd: MockInstance<RedisSaddFn>;
  srem: MockInstance<RedisSremFn>;
  smembers: MockInstance<RedisSMembersFn>;
  on: MockInstance<RedisEventFn>;
  connect: MockInstance<RedisConnectFn>;
  disconnect: MockInstance<RedisDisconnectFn>;
}

// WebSocket event types
type WSMessageFn = (data: Buffer | string) => void;
type WSCloseFn = () => void;
type WSErrorFn = (error: Error) => void;
type WSEventFn = (event: 'message' | 'close' | 'error', listener: WSMessageFn | WSCloseFn | WSErrorFn) => void;
type WSSendFn = (data: string | Buffer) => void;
type WSTerminateFn = () => void;

// WebSocket server event types
type WSServerEventFn = (event: string, listener: (socket: MockWebSocket) => void) => void;
type WSServerCloseFn = () => void;

// WebSocket mock types
export interface MockWebSocket extends Omit<WS, keyof WS> {
  on: MockInstance<WSEventFn>;
  send: MockInstance<WSSendFn>;
  close: MockInstance<WSCloseFn>;
  terminate: MockInstance<WSTerminateFn>;
}

export interface MockWebSocketServer extends Omit<WSServer, keyof WSServer> {
  on: MockInstance<WSServerEventFn>;
  clients: Set<MockWebSocket>;
  close: MockInstance<WSServerCloseFn>;
}

// Mail types
export interface MockMailResponse {
  messageId: string;
}

type MailSendFn = (options: Record<string, unknown>) => Promise<MockMailResponse>;
type MailVerifyFn = () => Promise<boolean>;

export interface MockNodeMailerTransport {
  sendMail: MockInstance<MailSendFn>;
  verify: MockInstance<MailVerifyFn>;
}

// Console mock types
type ConsoleFn = (...args: unknown[]) => void;

export interface MockConsole {
  log: MockInstance<ConsoleFn>;
  error: MockInstance<ConsoleFn>;
  warn: MockInstance<ConsoleFn>;
  info: MockInstance<ConsoleFn>;
}

// Review type
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

// Sentiment type
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