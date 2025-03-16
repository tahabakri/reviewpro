declare namespace jest {
  interface Mock<T = any, Y extends any[] = any[]> {
    (this: any, ...args: Y): T;
    mockImplementation(fn: (...args: Y) => T): this;
    mockImplementationOnce(fn: (...args: Y) => T): this;
    mockReturnValue(value: T): this;
    mockReturnValueOnce(value: T): this;
    mockResolvedValue<U>(value: U): this;
    mockResolvedValueOnce<U>(value: U): this;
    mockRejectedValue(value: any): this;
    mockRejectedValueOnce(value: any): this;
    mockClear(): void;
    mockReset(): void;
    mockRestore(): void;
    getMockName(): string;
    mock: {
      calls: Y[];
      instances: T[];
      invocationCallOrder: number[];
      results: { type: "return" | "throw"; value: any }[];
    };
    mockName(name: string): this;
    isMockFunction: true;
  }

  type MockedFunction<T extends (...args: any[]) => any> = Mock<ReturnType<T>, Parameters<T>> & T;
  type SpyInstance<T extends (...args: any[]) => any> = Mock<ReturnType<T>, Parameters<T>>;
}

declare module '@jest/globals' {
  export type Mock<T = any, Y extends any[] = any[]> = jest.Mock<T, Y>;
  export type MockedFunction<T extends (...args: any[]) => any> = jest.MockedFunction<T>;
  export type SpyInstance<T extends (...args: any[]) => any> = jest.SpyInstance<T>;
}