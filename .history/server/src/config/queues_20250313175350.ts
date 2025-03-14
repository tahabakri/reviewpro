import Queue from 'bull';
import { redisConfig } from './redis';

export const queues = {
  dataCollection: new Queue('data-collection', redisConfig),
  etl: new Queue('etl', redisConfig),
  sentiment: new Queue('sentiment', redisConfig),
  notifications: new Queue('notifications', redisConfig),
  alerts: new Queue('alerts', redisConfig),
} as const;

export type QueueNames = keyof typeof queues;