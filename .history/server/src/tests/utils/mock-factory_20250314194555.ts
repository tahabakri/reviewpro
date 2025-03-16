import { jest } from '@jest/globals';
import type {
  MockRedisInstance,
  MockWebSocket,
  MockWebSocketServer,
  MockNodeMailerTransport,
  MockMailResponse,
} from '../types';

// Mock response constants
const MOCK_RESPONSES = {
  OK: 'OK' as const,
  NULL: null as const,
  ONE: 1 as const,
  ZERO: 0 as const,
  EMPTY_ARRAY: [] as const
};

export class MockFactory {
  static createMockRedis(): MockRedisInstance {
    const redis = {
      get: jest.fn<() => Promise<string | null>>().mockResolvedValue(MOCK_RESPONSES.NULL),
      set: jest.fn<(key: string, value: string) => Promise<'OK'>>().mockResolvedValue(MOCK_RESPONSES.OK),
      del: jest.fn<(key: string) => Promise<number>>().mockResolvedValue(MOCK_RESPONSES.ONE),
      keys: jest.fn<(pattern: string) => Promise<string[]>>().mockResolvedValue([]),
      quit: jest.fn<() => Promise<'OK'>>().mockResolvedValue(MOCK_RESPONSES.OK),
      setex: jest.fn<(key: string, seconds: number, value: string) => Promise<'OK'>>().mockResolvedValue(MOCK_RESPONSES.OK),
      sadd: jest.fn<(key: string, ...members: string[]) => Promise<number>>().mockResolvedValue(MOCK_RESPONSES.ONE),
      srem: jest.fn<(key: string, ...members: string[]) => Promise<number>>().mockResolvedValue(MOCK_RESPONSES.ONE),
      smembers: jest.fn<(key: string) => Promise<string[]>>().mockResolvedValue([]),
      on: jest.fn<(event: string, listener: (...args: unknown[]) => void) => void>(),
      connect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      disconnect: jest.fn<() => void>()
    } as MockRedisInstance;

    return redis;
  }

  static createMockWebSocket(): MockWebSocket {
    return {
      on: jest.fn<(event: string, listener: (...args: unknown[]) => void) => void>(),
      send: jest.fn<(data: string | Buffer) => void>(),
      close: jest.fn<() => void>(),
      terminate: jest.fn<() => void>()
    } as MockWebSocket;
  }

  static createMockWebSocketServer(): MockWebSocketServer {
    return {
      on: jest.fn<(event: string, listener: (socket: MockWebSocket) => void) => void>(),
      clients: new Set<MockWebSocket>(),
      close: jest.fn<() => void>()
    } as MockWebSocketServer;
  }

  static createMockNodeMailerTransport(): MockNodeMailerTransport {
    const mailResponse: MockMailResponse = {
      messageId: 'test-message-id'
    };

    return {
      sendMail: jest.fn<(options: Record<string, unknown>) => Promise<MockMailResponse>>()
        .mockResolvedValue(mailResponse),
      verify: jest.fn<() => Promise<boolean>>().mockResolvedValue(true)
    } as MockNodeMailerTransport;
  }

  static createMockConsole() {
    return {
      log: jest.spyOn(console, 'log').mockImplementation((): void => {}),
      error: jest.spyOn(console, 'error').mockImplementation((): void => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation((): void => {}),
      info: jest.spyOn(console, 'info').mockImplementation((): void => {})
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
    const originalEnv = { ...process.env };
    process.env = { ...originalEnv, ...variables };
    return () => {
      process.env = originalEnv;
    };
  }
}