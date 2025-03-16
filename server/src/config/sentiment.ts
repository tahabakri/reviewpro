import dotenv from 'dotenv';
import { validateEnvironment } from '../services/sentiment';

// Load environment variables from .env file
dotenv.config();

export interface SentimentConfig {
  gemini: {
    apiKey: string;
    maxRetries: number;
    retryDelay: number;
  };
  redis: {
    url: string;
    cacheTTL: number;
  };
  analysis: {
    batchSize: number;
    processingInterval: number;
  };
}

function validateNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

export function loadSentimentConfig(): SentimentConfig {
  // Validate required environment variables
  const env = validateEnvironment();

  return {
    gemini: {
      apiKey: env.geminiApiKey,
      maxRetries: validateNumber(process.env.GEMINI_MAX_RETRIES, 3),
      retryDelay: validateNumber(process.env.GEMINI_RETRY_DELAY, 1000),
    },
    redis: {
      url: env.redisUrl,
      cacheTTL: env.cacheTTL || validateNumber(process.env.REDIS_CACHE_TTL, 3600),
    },
    analysis: {
      batchSize: validateNumber(process.env.SENTIMENT_BATCH_SIZE, 5),
      processingInterval: validateNumber(process.env.SENTIMENT_PROCESSING_INTERVAL, 1000),
    }
  };
}

// Example .env file template
export const envTemplate = `# Sentiment Analysis Configuration
GEMINI_API_KEY=your-api-key
REDIS_URL=redis://localhost:6379

# Optional Configuration
SENTIMENT_CACHE_TTL=3600
GEMINI_MAX_RETRIES=3
GEMINI_RETRY_DELAY=1000
SENTIMENT_BATCH_SIZE=5
SENTIMENT_PROCESSING_INTERVAL=1000
`;

// Function to validate the configuration
export function validateConfig(config: SentimentConfig): void {
  const { gemini, redis, analysis } = config;

  // Validate Gemini configuration
  if (!gemini.apiKey) {
    throw new Error('Gemini API key is required');
  }
  if (gemini.maxRetries < 0) {
    throw new Error('Gemini max retries must be non-negative');
  }
  if (gemini.retryDelay < 0) {
    throw new Error('Gemini retry delay must be non-negative');
  }

  // Validate Redis configuration
  if (!redis.url) {
    throw new Error('Redis URL is required');
  }
  if (redis.cacheTTL < 0) {
    throw new Error('Redis cache TTL must be non-negative');
  }

  // Validate Analysis configuration
  if (analysis.batchSize < 1) {
    throw new Error('Batch size must be at least 1');
  }
  if (analysis.processingInterval < 0) {
    throw new Error('Processing interval must be non-negative');
  }
}

// Export default configuration
export const defaultConfig: SentimentConfig = {
  gemini: {
    apiKey: '',
    maxRetries: 3,
    retryDelay: 1000,
  },
  redis: {
    url: 'redis://localhost:6379',
    cacheTTL: 3600,
  },
  analysis: {
    batchSize: 5,
    processingInterval: 1000,
  }
};