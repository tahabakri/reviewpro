import dotenv from 'dotenv';
import { createClient as createRedisClient } from 'redis';
import Bull from 'bull';
import { createClient } from '@supabase/supabase-js';
import { ApiConfig } from '../types';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  supabase: {
    url: process.env.SUPABASE_URL as string,
    serviceKey: process.env.SUPABASE_SERVICE_KEY as string,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  apis: {
    google: {
      apiKey: process.env.GOOGLE_API_KEY as string,
      placesApiKey: process.env.GOOGLE_PLACES_API_KEY as string,
      serviceAccount: {
        clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string,
        privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY as string,
      },
    },
    yelp: {
      apiKey: process.env.YELP_API_KEY as string,
    },
    tripadvisor: {
      apiKey: process.env.TRIPADVISOR_API_KEY as string,
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID as string,
      appSecret: process.env.FACEBOOK_APP_SECRET as string,
    },
  } as ApiConfig,
};

// Supabase client
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Redis client
export const redisClient = createRedisClient({
  url: `redis://${config.redis.host}:${config.redis.port}`,
});

// Initialize Redis client
redisClient.connect().catch(console.error);

// Bull queues
export const queues = {
  dataCollection: new Bull('data-collection', {
    redis: config.redis,
  }),
  etl: new Bull('etl', {
    redis: config.redis,
  }),
  sentiment: new Bull('sentiment-analysis', {
    redis: config.redis,
  }),
  notifications: new Bull('notifications', {
    redis: config.redis,
  }),
};

// Environment checks
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'GOOGLE_API_KEY',
  'GOOGLE_PLACES_API_KEY',
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
  'YELP_API_KEY',
  'TRIPADVISOR_API_KEY',
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});