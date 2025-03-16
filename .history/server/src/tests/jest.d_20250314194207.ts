declare module '@jest/globals' {
  export interface MockResult<T> {
    type: 'return' | 'throw';
    value: T;
  }

  export interface MockContext<T extends MockableFunction> {
    calls: Parameters<T>[];
    instances: ReturnType<T>[];
    invocationCallOrder: number[];
    results: MockResult<ReturnType<T>>[];
    lastCall: Parameters<T>;
  }

  export type MockableFunction = (...args: unknown[]) => unknown;

  export interface MockInstance<T extends MockableFunction = MockableFunction> {
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

  export type Mock<T extends MockableFunction> = MockInstance<T>;
  export type SpyInstance<T extends MockableFunction> = MockInstance<T>;

  export interface JestMatchers<T> {
    toBe(expected: T): void;
    toEqual(expected: T): void;
    toStrictEqual(expected: T): void;
    toBeNull(): void;
    toBeDefined(): void;
    toBeUndefined(): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBeGreaterThan(n: number): void;
    toBeGreaterThanOrEqual(n: number): void;
    toBeLessThan(n: number): void;
    toBeLessThanOrEqual(n: number): void;
    toContain(item: unknown): void;
    toContainEqual(item: unknown): void;
    toHaveLength(length: number): void;
    toHaveProperty(path: string, value?: unknown): void;
    toMatch(regexp: RegExp | string): void;
    toMatchObject(object: Record<string, unknown>): void;
    toThrow(message?: string | RegExp | Error): void;
    toThrowError(message?: string | RegExp | Error): void;
    toBeCalledWith(...args: unknown[]): void;
    toHaveBeenCalledWith(...args: unknown[]): void;
    toHaveBeenCalled(): void;
    toBeCalled(): void;
    toHaveBeenCalledTimes(n: number): void;
    toBeCalledTimes(n: number): void;
    resolves: JestMatchers<Promise<T>>;
    rejects: JestMatchers<Promise<T>>;
  }

  export const jest: {
    fn<T extends MockableFunction>(implementation?: T): MockInstance<T>;
    spyOn<T extends object, K extends keyof T>(
      object: T,
      method: K
    ): T[K] extends MockableFunction ? MockInstance<T[K]> : never;
    mock<T = unknown>(moduleName: string, factory?: () => T, options?: unknown): unknown;
    clearAllMocks(): void;
    resetAllMocks(): void;
    restoreAllMocks(): void;
    useRealTimers(): void;
    useFakeTimers(): void;
    runAllTimers(): void;
    advanceTimersByTime(msToRun: number): void;
  };

  export function describe(name: string, fn: () => void): void;
  export function beforeAll(fn: () => void | Promise<void>, timeout?: number): void;
  export function beforeEach(fn: () => void | Promise<void>, timeout?: number): void;
  export function afterAll(fn: () => void | Promise<void>, timeout?: number): void;
  export function afterEach(fn: () => void | Promise<void>, timeout?: number): void;
  export function it(name: string, fn: () => void | Promise<void>, timeout?: number): void;
  export function expect<T>(value: T): JestMatchers<T>;
}