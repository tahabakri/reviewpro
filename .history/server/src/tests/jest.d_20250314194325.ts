declare module '@jest/globals' {
  export interface MockResult<T> {
    type: 'return' | 'throw';
    value: T;
  }

  export interface MockContext<T> {
    calls: unknown[][];
    instances: T[];
    invocationCallOrder: number[];
    results: MockResult<T>[];
    lastCall: unknown[];
  }

  export interface JestMock<TArgs extends unknown[] = unknown[], TReturn = unknown> {
    (...args: TArgs): TReturn;
    mockImplementation(fn: (...args: TArgs) => TReturn): this;
    mockImplementationOnce(fn: (...args: TArgs) => TReturn): this;
    mockReturnValue(value: TReturn): this;
    mockReturnValueOnce(value: TReturn): this;
    mockResolvedValue<U>(value: U): JestMock<TArgs, Promise<U>>;
    mockResolvedValueOnce<U>(value: U): JestMock<TArgs, Promise<U>>;
    mockRejectedValue(value: unknown): JestMock<TArgs, Promise<never>>;
    mockRejectedValueOnce(value: unknown): JestMock<TArgs, Promise<never>>;
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
    getMockName(): string;
    mock: MockContext<TReturn>;
    mockName(name: string): this;
    isMockFunction: true;
  }

  export interface SpyInstance<TArgs extends unknown[] = unknown[], TReturn = unknown> 
    extends JestMock<TArgs, TReturn> {}

  export const jest: {
    fn<TArgs extends unknown[] = unknown[], TReturn = unknown>(
      implementation?: (...args: TArgs) => TReturn
    ): JestMock<TArgs, TReturn>;
    
    spyOn<T extends object, K extends keyof T>(
      object: T,
      method: K
    ): SpyInstance;

    clearAllMocks(): void;
    resetAllMocks(): void;
    restoreAllMocks(): void;
    useRealTimers(): void;
    useFakeTimers(): void;
    runAllTimers(): void;
    advanceTimersByTime(msToRun: number): void;
    
    mock<T = unknown>(
      moduleName: string,
      factory?: () => T,
      options?: unknown
    ): { [K in keyof T]: T[K] extends (...args: any[]) => any ? JestMock<Parameters<T[K]>, ReturnType<T[K]>> : T[K] };
  };

  export function describe(name: string, fn: () => void): void;
  export function beforeAll(fn: () => void | Promise<void>, timeout?: number): void;
  export function beforeEach(fn: () => void | Promise<void>, timeout?: number): void;
  export function afterAll(fn: () => void | Promise<void>, timeout?: number): void;
  export function afterEach(fn: () => void | Promise<void>, timeout?: number): void;
  export function it(name: string, fn: () => void | Promise<void>, timeout?: number): void;

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

  export function expect<T>(value: T): JestMatchers<T>;
}