import { ReviewData, ProcessedReview } from '../../types';
import { defaultMockResponse } from '../mocks/language-client.mock';

export const createMockReview = (overrides: Partial<ReviewData> = {}): ReviewData => ({
  id: 'test-review-1',
  rating: 4,
  content: 'Great service and food!',
  platform: 'google',
  created_at: '2024-03-13T10:00:00Z',
  ...overrides,
});

export const createMockProcessedReview = (overrides: Partial<ProcessedReview> = {}): ProcessedReview => ({
  id: 'test-review-1',
  entity_id: 'test-entity-1',
  rating: 4,
  content: 'Great service and food!',
  platform: 'google',
  created_at: '2024-03-13T10:00:00Z',
  sentiment: {
    id: 'sentiment-1',
    entity_id: 'test-entity-1',
    score: defaultMockResponse.analyzeSentiment.documentSentiment?.score || 0,
    analysis: {
      sentences: defaultMockResponse.analyzeSentiment.sentences?.map(s => ({
        text: s.text?.content,
        sentiment: {
          score: s.sentiment?.score,
          magnitude: s.sentiment?.magnitude,
        },
      })),
    },
  },
  themes: defaultMockResponse.classifyText.categories?.map(c => ({
    review_id: 'test-review-1',
    category: c.name || '',
    sentiment: c.confidence || 0,
    frequency: 1,
  })) || [],
  ...overrides,
});

export const mockSupabaseResponse = <T>(data: T) => ({
  data,
  error: null,
});

export const mockSupabaseError = (message: string) => ({
  data: null,
  error: { message },
});

export const createMockSupabaseClient = () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn(),
});

export const waitForQueueProcessing = async () => {
  // Wait for all promises to resolve
  await new Promise(resolve => setTimeout(resolve, 0));
};