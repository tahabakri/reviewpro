export interface RateLimitConfig {
  requestsPerSecond: number;
  maxRetries: number;
  retryDelay: number;
}

export class RateLimiter {
  private lastRequest: number = 0;
  private requestQueue: Promise<void> = Promise.resolve();

  constructor(private config: RateLimitConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue = this.requestQueue
        .then(async () => {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequest;
          const minDelay = (1000 / this.config.requestsPerSecond);
          
          if (timeSinceLastRequest < minDelay) {
            await new Promise(r => setTimeout(r, minDelay - timeSinceLastRequest));
          }
          
          this.lastRequest = Date.now();
          let lastError;
          
          for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
            try {
              const result = await fn();
              resolve(result);
              return;
            } catch (error) {
              lastError = error;
              if (attempt < this.config.maxRetries - 1) {
                await new Promise(r => setTimeout(r, this.config.retryDelay));
              }
            }
          }
          
          reject(lastError);
        })
        .catch(reject);
    });
  }
}