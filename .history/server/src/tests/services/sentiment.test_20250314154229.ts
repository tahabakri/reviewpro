import { Redis } from 'ioredis';
import { GeminiClient, SentimentAnalysisResult } from '../../services/gemini/client';
import { SentimentAnalyzer, ReviewData } from '../../services/sentiment/analyzer';
import { GeminiError, ErrorCodes } from '../../services/gemini/error';

// Mock Redis client
jest.mock('ioredis');
const mockRedis = {
  get: jest.fn(),
  setex: jest.fn(),
} as unknown as jest.Mocked<Redis>;

// Mock Gemini client
jest.mock('../../services/gemini/client');
const mockGemini = {
  analyzeSentiment: jest.fn(),
} as unknown as jest.Mocked<GeminiClient>;

describe('SentimentAnalyzer', () => {
  let analyzer: SentimentAnalyzer;

  beforeEach(() => {
    jest.clearAllMocks();
    analyzer = new SentimentAnalyzer(mockGemini, mockRedis);
  });

  describe('analyzeReview', () => {
    const mockReview: ReviewData = {
      id: '123',
      text: 'Great service!',
      createdAt: new Date(),
    };

    const mockAnalysis: SentimentAnalysisResult = {
      sentiment: 'positive',
      score: 0.9,
      keyPhrases: ['great service'],
      emotionalTone: 'satisfied',
    };

    it('should analyze a review successfully', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockGemini.analyzeSentiment.mockResolvedValue(mockAnalysis);

      const result = await analyzer.analyzeReview(mockReview);

      expect(result).toEqual({
        ...mockAnalysis,
        reviewId: mockReview.id,
        analyzedAt: expect.any(Date),
      });
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('should return cached analysis if available', async () => {
      const cachedAnalysis = {
        ...mockAnalysis,
        reviewId: mockReview.id,
        analyzedAt: new Date(),
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedAnalysis));

      const result = await analyzer.analyzeReview(mockReview);

      expect(result).toEqual(cachedAnalysis);
      expect(mockGemini.analyzeSentiment).not.toHaveBeenCalled();
    });

    it('should handle Gemini errors', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockGemini.analyzeSentiment.mockRejectedValue(
        new GeminiError('Rate limit exceeded', ErrorCodes.RATE_LIMIT, true)
      );

      await expect(analyzer.analyzeReview(mockReview)).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('batchAnalyze', () => {
    const mockReviews: ReviewData[] = [
      { id: '1', text: 'Great service!', createdAt: new Date() },
      { id: '2', text: 'Poor experience.', createdAt: new Date() },
    ];

    const mockAnalyses: SentimentAnalysisResult[] = [
      {
        sentiment: 'positive',
        score: 0.9,
        keyPhrases: ['great service'],
        emotionalTone: 'satisfied',
      },
      {
        sentiment: 'negative',
        score: 0.2,
        keyPhrases: ['poor experience'],
        emotionalTone: 'disappointed',
      },
    ];

    it('should analyze multiple reviews', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockGemini.analyzeSentiment
        .mockResolvedValueOnce(mockAnalyses[0])
        .mockResolvedValueOnce(mockAnalyses[1]);

      const results = await analyzer.batchAnalyze(mockReviews);

      expect(results).toHaveLength(2);
      expect(results[0].sentiment).toBe('positive');
      expect(results[1].sentiment).toBe('negative');
    });
  });

  describe('calculateStats', () => {
    const mockAnalyzedReviews = [
      {
        reviewId: '1',
        sentiment: 'positive',
        score: 0.9,
        keyPhrases: ['great service', 'friendly staff'],
        emotionalTone: 'satisfied',
        analyzedAt: new Date(),
      },
      {
        reviewId: '2',
        sentiment: 'negative',
        score: 0.2,
        keyPhrases: ['poor service', 'long wait'],
        emotionalTone: 'frustrated',
        analyzedAt: new Date(),
      },
      {
        reviewId: '3',
        sentiment: 'positive',
        score: 0.8,
        keyPhrases: ['great food', 'friendly staff'],
        emotionalTone: 'happy',
        analyzedAt: new Date(),
      },
    ];

    it('should calculate correct statistics', async () => {
      const stats = await analyzer.calculateStats(mockAnalyzedReviews);

      expect(stats.positive).toBe(2);
      expect(stats.negative).toBe(1);
      expect(stats.neutral).toBe(0);
      expect(stats.averageScore).toBeCloseTo(0.63);
      expect(stats.totalReviews).toBe(3);
      
      // Check top phrases
      expect(stats.topPhrases).toContainEqual({
        text: 'friendly staff',
        frequency: 2,
        sentiment: 'positive',
      });
    });
  });
});

// Test Gemini client implementation
describe('GeminiClient', () => {
  let client: GeminiClient;

  beforeEach(() => {
    client = GeminiClient.getInstance('test-api-key');
  });

  it('should be a singleton', () => {
    const client2 = GeminiClient.getInstance('different-key');
    expect(client2).toBe(client);
  });

  it('should analyze sentiment correctly', async () => {
    const mockResponse = {
      response: {
        text: () => JSON.stringify({
          sentiment: 'positive',
          score: 0.9,
          keyPhrases: ['great service'],
          emotionalTone: 'satisfied',
        }),
      },
    };

    // @ts-ignore - mock implementation
    client.model = {
      generateContent: jest.fn().mockResolvedValue(mockResponse),
    };

    const result = await client.analyzeSentiment('Great service!');

    expect(result.sentiment).toBe('positive');
    expect(result.score).toBe(0.9);
    expect(result.keyPhrases).toContain('great service');
    expect(result.emotionalTone).toBe('satisfied');
  });

  it('should validate sentiment response', async () => {
    const mockResponse = {
      response: {
        text: () => JSON.stringify({
          sentiment: 'invalid',
          score: 2,
          keyPhrases: 'not-an-array',
          emotionalTone: '',
        }),
      },
    };

    // @ts-ignore - mock implementation
    client.model = {
      generateContent: jest.fn().mockResolvedValue(mockResponse),
    };

    await expect(client.analyzeSentiment('Test')).rejects.toThrow('Invalid sentiment value');
  });
});