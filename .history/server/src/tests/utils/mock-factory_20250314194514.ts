import { jest } from '@jest/globals';
import type {
  MockRedisInstance,
  MockWebSocket,
  MockWebSocketServer,
  MockNodeMailerTransport,
  MockMailResponse,
  RedisMockResponses
} from '../types';

export class MockFactory {
  static createMockRedis(): MockRedisInstance {
    return {
      get: jest.fn().mockResolvedValue(RedisMockResponses.NULL),
      set: jest.fn().mockResolvedValue(RedisMockResponses.OK),
      del: jest.fn().mockResolvedValue(RedisMockResponses.ONE),
      keys: jest.fn().mockResolvedValue(RedisMockResponses.EMPTY_ARRAY),
      quit: jest.fn().mockResolvedValue(RedisMockResponses.OK),
      setex: jest.fn().mockResolvedValue(RedisMockResponses.OK),
      sadd: jest.fn().mockResolvedValue(RedisMockResponses.ONE),
      srem: jest.fn().mockResolvedValue(RedisMockResponses.ONE),
      smembers: jest.fn().mockResolvedValue(RedisMockResponses.EMPTY_ARRAY),
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn()
    } as MockRedisInstance;
  }

  static createMockWebSocket(): MockWebSocket {
    return {
      on: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
      terminate: jest.fn()
    } as MockWebSocket;
  }

  static createMockWebSocketServer(): MockWebSocketServer {
    return {
      on: jest.fn(),
      clients: new Set<MockWebSocket>(),
      close: jest.fn()
    } as MockWebSocketServer;
  }

  static createMockNodeMailerTransport(): MockNodeMailerTransport {
    const mailResponse: MockMailResponse = {
      messageId: 'test-message-id'
    };

    return {
      sendMail: jest.fn().mockResolvedValue(mailResponse),
      verify: jest.fn().mockResolvedValue(true)
    } as MockNodeMailerTransport;
  }

  static createMockConsole() {
    return {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation()
    };
  }

  static resetAllMocks() {
    jest.clearAllMocks();
    jest.resetAllMocks();
  }

  static useFakeTimers() {
    jest.useFakeTimers();
  }

  static useRealTimers() {
    jest.useRealTimers();
  }

  static advanceTimersByTime(ms: number) {
    jest.advanceTimersByTime(ms);
  }

  static async runAllTimersAndPromises() {
    jest.runAllTimers();
    await Promise.resolve();
  }

  static mockProcessExit() {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    return mockExit;
  }

  static mockEnvironmentVariables(variables: Record<string, string>) {
    const originalEnv = process.env;
    process.env = { ...originalEnv, ...variables };
    return () => {
      process.env = originalEnv;
    };
  }
}