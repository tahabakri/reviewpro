export class DataCollectionError extends Error {
  constructor(
    message: string,
    public readonly platform: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'DataCollectionError';
  }
}