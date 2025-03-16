import Queue from 'bull';
import { redisConfig } from './redis';

export const queues = {
  dataCollection: new Queue('data-collection', { redis: redisConfig }),
  etl: new Queue('etl', { redis: redisConfig }),
  sentiment: new Queue('sentiment', { redis: redisConfig }),
  notifications: new Queue('notifications', { redis: redisConfig }),
  alerts: new Queue('alerts', { redis: redisConfig }),
} as const;

export type QueueNames = keyof typeof queues;