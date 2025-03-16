// Type definitions for Jest mocking functionality
declare namespace jest {
  type MockableFunction = (...args: unknown[]) => unknown;

  interface MockResult<T> {
    type: 'return' | 'throw';
    value: T;
  }

  interface MockContext<T extends MockableFunction> {
    calls: Parameters<T>[];
    instances: ReturnType<T>[];
    invocationCallOrder: number[];
    results: MockResult<ReturnType<T>>[];
    lastCall: Parameters<T>;
  }

  interface MockInstance<T extends MockableFunction = MockableFunction> {
    (...args: Parameters<T>): ReturnType<T>;
    mockImplementation(fn: T): this;
    mockImplementationOnce(fn: T): this;
    mockReturnValue(value: ReturnType<T>): this;
    mockReturnValueOnce(value: ReturnType<T>): this;
    mockResolvedValue<U>(value: U): this;
    mockResolvedValueOnce<U>(value: U): this;
    mockRejectedValue(value: unknown): this;
    mockRejectedValueOnce(value: unknown): this;
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
    getMockName(): string;
    mock: MockContext<T>;
    mockName(name: string): this;
    isMockFunction: true;
  }

  interface JestMockFunctions {
    fn<T extends MockableFunction>(implementation?: T): MockInstance<T>;
    spyOn<T extends object, K extends keyof T>(
      object: T,
      method: K
    ): T[K] extends MockableFunction ? MockInstance<T[K]> : never;
    clearAllMocks(): void;
    resetAllMocks(): void;
    restoreAllMocks(): void;
    useRealTimers(): void;
    useFakeTimers(): void;
    runAllTimers(): void;
    advanceTimersByTime(msToRun: number): void;
    mock<T = unknown>(moduleName: string, factory?: () => T, options?: unknown): jest.Mocked<T>;
  }

  type Mock<T extends MockableFunction> = MockInstance<T>;
  type SpyInstance<T extends MockableFunction> = MockInstance<T>;
}

declare const jest: jest.JestMockFunctions;

declare module '@jest/globals' {
  export const jest: jest.JestMockFunctions;
  export type Mock<T extends jest.MockableFunction> = jest.MockInstance<T>;
  export type SpyInstance<T extends jest.MockableFunction> = jest.MockInstance<T>;
  
  export function beforeAll(fn: () => void | Promise<void>, timeout?: number): void;
  export function beforeEach(fn: () => void | Promise<void>, timeout?: number): void;
  export function afterAll(fn: () => void | Promise<void>, timeout?: number): void;
  export function afterEach(fn: () => void | Promise<void>, timeout?: number): void;
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void | Promise<void>, timeout?: number): void;
  export function expect<T>(actual: T): jest.Matchers<T>;
}