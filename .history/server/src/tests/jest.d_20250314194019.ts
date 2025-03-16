// Type definitions for Jest mocking functionality
declare namespace jest {
  type MockableFunction = (...args: unknown[]) => unknown;
  type ImplementationFunction<T extends MockableFunction> = (...args: Parameters<T>) => ReturnType<T>;

  interface MockResult<T> {
    type: 'return' | 'throw';
    value: T;
  }

  interface MockState<T extends MockableFunction> {
    calls: Parameters<T>[];
    instances: ReturnType<T>[];
    invocationCallOrder: number[];
    results: MockResult<ReturnType<T>>[];
  }

  interface Mock<T extends MockableFunction = MockableFunction> {
    (...args: Parameters<T>): ReturnType<T>;
    mockImplementation(fn: ImplementationFunction<T>): this;
    mockImplementationOnce(fn: ImplementationFunction<T>): this;
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
    mock: MockState<T>;
    mockName(name: string): this;
    isMockFunction: true;
  }

  type MockedFunction<T extends MockableFunction> = Mock<T> & T;
  type SpyInstance<T extends MockableFunction> = Mock<T>;
}

declare module '@jest/globals' {
  interface JestMockExports {
    fn<T extends jest.MockableFunction>(implementation?: jest.ImplementationFunction<T>): jest.Mock<T>;
    spyOn<T extends object, K extends keyof T>(
      object: T,
      method: K
    ): T[K] extends jest.MockableFunction ? jest.SpyInstance<T[K]> : never;
  }

  export const jest: JestMockExports;
  export type Mock<T extends jest.MockableFunction = jest.MockableFunction> = jest.Mock<T>;
  export type MockedFunction<T extends jest.MockableFunction> = jest.MockedFunction<T>;
  export type SpyInstance<T extends jest.MockableFunction> = jest.SpyInstance<T>;
}