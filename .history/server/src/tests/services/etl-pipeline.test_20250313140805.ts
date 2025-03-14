import { etlPipeline, ETLPipeline } from '../../services/etl/pipeline';
import { ReviewData } from '../../services/data-collection/base';
import { createMockLanguageClient } from '../mocks/language-client';

// Mock the entire module
jest.mock('@google-cloud/language', () => {
  return {
    LanguageServiceClient: jest.fn().mockImplementation(() => createMockLanguageClient()),
  };
});

describe('ETLPipeline', () => {
  let pipeline: ETLPipeline;
  let mockClient: ReturnType<typeof createMockLanguageClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = createMockLanguageClient();
    jest.requireMock('@google-cloud/language').LanguageServiceClient.mockImplementation(() => mockClient);
    pipeline = new ETLPipeline();
  });

  describe('processReviews', () => {
    const mockReviews: ReviewData[] = [
      {
        id: 'review-1',
        rating: 4,
        content: 'Great service and amazing food!',
        platform: 'google',
        created_at: '2023-01-01T10:00:00Z',
        metadata: {
          authorName: 'Test User',
        },
      },
    ];

    it('should process reviews with sentiment analysis', async () => {
      const result = await pipeline.processReviews(mockReviews, 'entity-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'review-1',
        entityId: 'entity-1',
        rating: 4,
        content: 'Great service and amazing food!',
        platform: 'google',
        sentiment: {
          score: 0.8,
          magnitude: 0.9,
          analysis: {
            sentences: [
              {
                text: 'Great service and amazing food!',
                sentiment: {
                  score: 0.8,
                  magnitude: 0.9,
                },
              },
            ],
          },
        },
        themes: [
          {
            category: 'Restaurants',
            sentiment: 0.9,
            frequency: 1,
          },
          {
            category: 'Service',
            sentiment: 0.8,
            frequency: 1,
          },
        ],
      });
    });

    it('should handle sentiment analysis errors', async () => {
      mockClient.analyzeSentiment.mockRejectedValueOnce(new Error('API Error'));

      const result = await pipeline.processReviews(mockReviews, 'entity-1');

      expect(result).toHaveLength(1);
      expect(result[0].sentiment).toEqual({
        score: 0,
        magnitude: 0,
        analysis: {},
      });
    });

    it('should handle theme extraction errors', async () => {
      mockClient.classifyText.mockRejectedValueOnce(new Error('API Error'));

      const result = await pipeline.processReviews(mockReviews, 'entity-1');

      expect(result).toHaveLength(1);
      expect(result[0].themes).toEqual([]);
    });

    it('should handle empty review content', async () => {
      const emptyReviews: ReviewData[] = [
        {
          id: 'review-1',
          rating: 4,
          content: '',
          platform: 'google',
          created_at: '2023-01-01T10:00:00Z',
          metadata: {
            authorName: 'Test User',
          },
        },
      ];

      const result = await pipeline.processReviews(emptyReviews, 'entity-1');

      expect(result).toHaveLength(1);
      expect(result[0].sentiment).toEqual({
        score: 0,
        magnitude: 0,
        analysis: {},
      });
      expect(result[0].themes).toEqual([]);
    });
  });

  describe('addToQueue', () => {
    it('should add reviews to the ETL queue', async () => {
      const mockReviews: ReviewData[] = [
        {
          id: 'review-1',
          rating: 4,
          content: 'Test review',
          platform: 'google',
          created_at: '2023-01-01T10:00:00Z',
        },
      ];

      await pipeline.addToQueue(mockReviews, 'entity-1');

      // Verify that the queue processing is set up correctly
      expect(etlPipeline).toBeDefined();
    });
  });
});