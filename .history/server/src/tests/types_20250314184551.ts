import { Review } from '../types/reviews';
import { SentimentResult } from '../types/sentiment';
import { Redis } from 'ioredis';
import { WebSocket, Server as WebSocketServer } from 'ws';

export interface MockReview extends Review {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  language: string;
}

export interface MockSentiment extends SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  keyPhrases: string[];
  emotionalTone: string;
}

export interface MockRedis extends Redis {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
  keys: jest.Mock;
  quit: jest.Mock;
  on: jest.Mock;
  connect: jest.Mock;
  disconnect: jest.Mock;
  setex: jest.Mock;
  sadd: jest.Mock;
  smembers: jest.Mock;
  srem: jest.Mock;
}

export interface MockWebSocket extends WebSocket {
  on: jest.Mock;
  send: jest.Mock;
  close: jest.Mock;
  terminate: jest.Mock;
}

export interface MockWebSocketServer extends WebSocketServer {
  on: jest.Mock;
  clients: Set<MockWebSocket>;
  close: jest.Mock;
}

export type MockConsole = {
  log: jest.SpyInstance;
  error: jest.SpyInstance;
  warn: jest.SpyInstance;
  info: jest.SpyInstance;
};

export interface MockNodeMailerTransport {
  sendMail: jest.Mock<Promise<{ messageId: string }>>;
  verify: jest.Mock<Promise<boolean>>;
}