import { jest } from '@jest/globals';
import type {
  MockRedisInstance,
  MockWebSocket,
  MockWebSocketServer,
  MockNodeMailerTransport,
  MockMailResponse,
  WSEventTypes
} from '../types';

// Mock response constants
const MOCK_RESPONSES = {
  OK: 'OK',
  NULL: null,
  ONE: 1,
  ZERO: 0,
  EMPTY_ARRAY: [] as string[]
} as const;

export class MockFactory {
  static createMockRedis(): MockRedisInstance {
    const redis = {
      get: jest.fn().mockResolvedValue(MOCK_RESPONSES.NULL),
      set: jest.fn().mockResolvedValue(MOCK_RESPONSES.OK),
      del: jest.fn().mockResolvedValue(MOCK_RESPONSES.ONE),
      keys: jest.fn().mockResolvedValue(MOCK_RESPONSES.EMPTY_ARRAY),
      quit: jest.fn().mockResolvedValue(MOCK_RESPONSES.OK),
      setex: jest.fn().mockResolvedValue(MOCK_RESPONSES.OK),
      sadd: jest.fn().mockResolvedValue(MOCK_RESPONSES.ONE),
      srem: jest.fn().mockResolvedValue(MOCK_RESPONSES.ONE),
      smembers: jest.fn().mockResolvedValue(MOCK_RESPONSES.EMPTY_ARRAY),
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn()
    };

    return redis as unknown as MockRedisInstance;
  }

  static createMockWebSocket(): MockWebSocket {
    const socket = {
      on: jest.fn((event: keyof WSEventTypes, listener: WSEventTypes[keyof WSEventTypes]) => {
        return socket;
      }),
      send: jest.fn(),
      close: jest.fn(),
      terminate: jest.fn()
    };

    return socket as unknown as MockWebSocket;
  }

  static createMockWebSocketServer(): MockWebSocketServer {
    const server = {
      on: jest.fn(),
      clients: new Set<MockWebSocket>(),
      close: jest.fn()
    };

    return server as unknown as MockWebSocketServer;
  }

  static createMockNodeMailerTransport(): MockNodeMailerTransport {
    const mailResponse: MockMailResponse = {
      messageId: 'test-message-id'
    };

    const transport = {
      sendMail: jest.fn().mockResolvedValue(mailResponse),
      verify: jest.fn().mockResolvedValue(true)
    };

    return transport as unknown as MockNodeMailerTransport;
  }

  static createMockConsole() {
    const mockConsole = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn()
    };

    jest.spyOn(console, 'log').mockImplementation(mockConsole.log);
    jest.spyOn(console, 'error').mockImplementation(mockConsole.error);
    jest.spyOn(console, 'warn').mockImplementation(mockConsole.warn);
    jest.spyOn(console, 'info').mockImplementation(mockConsole.info);

    return mockConsole;
  }

  static resetAllMocks(): void {
    jest.clearAllMocks();
    jest.resetAllMocks();
  }

  static useFakeTimers(): void {
    jest.useFakeTimers();
  }

  static useRealTimers(): void {
    jest.useRealTimers();
  }

  static advanceTimersByTime(ms: number): void {
    jest.advanceTimersByTime(ms);
  }

  static async runAllTimersAndPromises(): Promise<void> {
    jest.runAllTimers();
    await Promise.resolve();
  }

  static mockProcessExit(): jest.SpyInstance {
    return jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  }

  static mockEnvironmentVariables(variables: Record<string, string>): () => void {
    const originalEnv = { ...process.env };
    process.env = { ...originalEnv, ...variables };
    return () => {
      process.env = originalEnv;
    };
  }
}