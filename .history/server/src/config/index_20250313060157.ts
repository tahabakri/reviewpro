import dotenv from 'dotenv';
import { Redis } from 'redis';
import Bull from 'bull';

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
  },
};

// Redis client
export const redisClient = new Redis({
  url: `redis://${config.redis.host}:${config.redis.port}`,
});

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
};