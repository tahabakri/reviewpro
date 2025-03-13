import { createClient } from '@supabase/supabase-js';
import { createClient as createRedisClient } from 'redis';
import Bull from 'bull';
import { env } from '../utils/validateEnv';
import { Database } from '../types/database.types';

// Supabase client
export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Redis client
export const redisClient = createRedisClient({
  url: `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`,
});

// Initialize Redis client
redisClient.connect().catch(console.error);

// Bull queues for background processing
export const queues = {
  dataCollection: new Bull('data-collection', {
    redis: {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
    },
  }),
  etl: new Bull('etl', {
    redis: {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
    },
  }),
  sentiment: new Bull('sentiment-analysis', {
    redis: {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
    },
  }),
  notifications: new Bull('notifications', {
    redis: {
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
    },
  }),
};

// API configuration for external services
export const apis = {
  google: {
    apiKey: env.GOOGLE_API_KEY,
    placesApiKey: env.GOOGLE_PLACES_API_KEY,
    serviceAccount: {
      clientEmail: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    },
  },
  yelp: {
    apiKey: env.YELP_API_KEY,
  },
  tripadvisor: {
    apiKey: env.TRIPADVISOR_API_KEY,
  },
  facebook: env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET
    ? {
        appId: env.FACEBOOK_APP_ID,
        appSecret: env.FACEBOOK_APP_SECRET,
      }
    : null,
};

// Application configuration
export const config = {
  port: Number(env.PORT),
  environment: env.NODE_ENV,
  redis: {
    host: env.REDIS_HOST,
    port: Number(env.REDIS_PORT),
  },
  apis, // Export APIs configuration
};

// Queue configuration
export const queueConfig = {
  dataCollection: {
    concurrency: 5,
    retryLimit: 3,
    backoffDelay: 1000, // 1 second
  },
  etl: {
    concurrency: 3,
    retryLimit: 2,
    backoffDelay: 2000, // 2 seconds
  },
  sentiment: {
    concurrency: 2,
    retryLimit: 2,
    backoffDelay: 3000, // 3 seconds
  },
};