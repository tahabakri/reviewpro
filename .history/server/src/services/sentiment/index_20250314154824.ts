import { Redis } from 'ioredis';
import { GeminiClient } from '../gemini/client';
import { SentimentAnalyzer } from './analyzer';

interface SentimentConfig {
  geminiApiKey: string;
  redisUrl: string;
  cacheTTL?: number;
}

export async function initializeSentimentAnalysis(config: SentimentConfig) {
  // Initialize Redis client
  const redis = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      if (times > 3) {
        return null;
      }
      return Math.min(times * 100, 3000);
    }
  });

  // Initialize Gemini client
  const gemini = GeminiClient.getInstance(config.geminiApiKey);

  // Initialize sentiment analyzer
  const analyzer = new SentimentAnalyzer(
    gemini,
    redis,
    config.cacheTTL || 3600 // Default 1 hour TTL
  );

  return {
    analyzer,
    async shutdown() {
      await redis.quit();
    }
  };
}

// Environment validation
export function validateEnvironment() {
  const required = ['GEMINI_API_KEY', 'REDIS_URL'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  return {
    geminiApiKey: process.env.GEMINI_API_KEY!,
    redisUrl: process.env.REDIS_URL!,
    cacheTTL: process.env.SENTIMENT_CACHE_TTL 
      ? parseInt(process.env.SENTIMENT_CACHE_TTL, 10)
      : undefined
  };
}

// Utility types for sentiment analysis results
export interface SentimentResult {
  reviewId: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  keyPhrases: string[];
  emotionalTone: string;
  analyzedAt: Date;
}

export interface SentimentStats {
  positive: number;
  negative: number;
  neutral: number;
  averageScore: number;
  totalReviews: number;
  topPhrases: Array<{
    text: string;
    frequency: number;
    sentiment: string;
  }>;
}

export interface TimelineData {
  date: string;
  value: number;
  volume: number;
}

// Helper functions for sentiment analysis
export function calculateSentimentScore(score: number): 'positive' | 'negative' | 'neutral' {
  if (score >= 0.6) return 'positive';
  if (score <= 0.4) return 'negative';
  return 'neutral';
}

export function formatTimelineData(
  data: SentimentResult[],
  timeRange: 'day' | 'week' | 'month' = 'week'
): TimelineData[] {
  const timelineMap = new Map<string, { total: number; count: number }>();
  
  data.forEach(result => {
    const date = new Date(result.analyzedAt);
    const key = date.toISOString().split('T')[0];
    
    const existing = timelineMap.get(key) || { total: 0, count: 0 };
    timelineMap.set(key, {
      total: existing.total + result.score,
      count: existing.count + 1
    });
  });
  
  return Array.from(timelineMap.entries())
    .map(([date, { total, count }]) => ({
      date,
      value: total / count,
      volume: count
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}