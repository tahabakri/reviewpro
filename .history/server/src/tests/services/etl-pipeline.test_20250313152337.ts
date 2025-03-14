import { ETLPipeline } from '../../services/etl/pipeline';
import { ReviewData } from '../../services/data-collection/base';
import { AlertType } from '../../types';
import { supabase } from '../../config';
import { alertSystem } from '../../services/alerts/instance';
import { notificationService } from '../../services/notifications';
import { LanguageServiceClient } from '@google-cloud/language';
import { createMockLanguageClient } from '../mocks/language-client.mock';

jest.mock('@google-cloud/language', () => ({
  LanguageServiceClient: jest.fn().mockImplementation(() => createMockLanguageClient()),
}));

jest.mock('../../config', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  },
  config: {
    apis: {
      google: {
        serviceAccount: {
          clientEmail: 'test@test.com',
          privateKey: 'test-key',
        },
      },
    },
  },
}));

jest.mock('../../services/alerts/instance', () => ({
  alertSystem: {
    processAlert: jest.fn(),
  },
}));

jest.mock('../../services/notifications', () => ({
  notificationService: {
    sendAlertNotification: jest.fn(),
  },
}));

describe('ETLPipeline', () => {
  let pipeline: ETLPipeline;
  let mockLanguageClient: jest.Mocked<LanguageServiceClient>;

  const mockReviews: ReviewData[] = [
    {
      id: 'review-1',
      rating: 4,
      content: 'Great service and food!',
      platform: 'google',
      created_at: '2024-03-13T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockLanguageClient = createMockLanguageClient() as jest.Mocked<LanguageServiceClient>;
    ((LanguageServiceClient as unknown) as jest.MockedClass<typeof LanguageServiceClient>)
      .mockImplementation(() => mockLanguageClient);
    pipeline = new ETLPipeline();
  });

  describe('processReviews', () => {
    it('should process reviews with sentiment and theme analysis', async () => {
      const mockInsertResponse = {
        data: [{
          id: 'review-1',
          entity_id: 'entity-1',
          rating: 4,
          content: 'Great service and food!',
          platform: 'google',
          created_at: '2024-03-13T10:00:00Z',
          sentiment_score: 0.8,
          sentiment_magnitude: 0.9,
          sentiment_analysis: {
            sentences: [
              {
                text: 'Great service and food!',
                sentiment: { score: 0.8, magnitude: 0.9 },
              },
            ],
          },
          themes: [
            { category: 'Food', sentiment: 0.9, frequency: 1 },
            { category: 'Service', sentiment: 0.8, frequency: 1 },
          ],
        }],
        error: null,
      };

      (supabase.from as jest.Mock)
        .mockImplementationOnce(() => ({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockResolvedValueOnce(mockInsertResponse),
        }));

      const result = await pipeline.processReviews(mockReviews, 'entity-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'review-1',
        entity_id: 'entity-1',
        rating: 4,
        content: 'Great service and food!',
        sentiment_score: 0.8,
      });
      expect(mockLanguageClient.analyzeSentiment).toHaveBeenCalled();
      expect(mockLanguageClient.classifyText).toHaveBeenCalled();
    });

    it('should handle empty content gracefully', async () => {
      const emptyReview = { ...mockReviews[0], content: '' };
      
      (supabase.from as jest.Mock)
        .mockImplementationOnce(() => ({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockResolvedValueOnce({ data: [], error: null }),
        }));

      const result = await pipeline.processReviews([emptyReview], 'entity-1');

      expect(result).toHaveLength(0);
      expect(mockLanguageClient.analyzeSentiment).not.toHaveBeenCalled();
      expect(mockLanguageClient.classifyText).not.toHaveBeenCalled();
    });
  });

  describe('checkAlerts', () => {
    const mockAlert = {
      id: 'alert-1',
      entity_id: 'entity-1',
      type: 'sentiment_drop' as AlertType,
      conditions: { threshold: 0.5 },
      active: true,
    };

    it('should process alerts and send notifications when triggered', async () => {
      (supabase.from as jest.Mock)
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValueOnce({ data: mockAlert }),
        }));

      (alertSystem.processAlert as jest.Mock).mockResolvedValueOnce(true);

      await pipeline.checkAlerts('entity-1', 'sentiment_drop');

      expect(alertSystem.processAlert).toHaveBeenCalledWith(mockAlert);
      expect(notificationService.sendAlertNotification).toHaveBeenCalledWith(
        mockAlert,
        'entity-1'
      );
    });

    it('should not send notifications when alert is not triggered', async () => {
      (supabase.from as jest.Mock)
        .mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValueOnce({ data: mockAlert }),
        }));

      (alertSystem.processAlert as jest.Mock).mockResolvedValueOnce(false);

      await pipeline.checkAlerts('entity-1', 'sentiment_drop');

      expect(alertSystem.processAlert).toHaveBeenCalledWith(mockAlert);
      expect(notificationService.sendAlertNotification).not.toHaveBeenCalled();
    });
  });
});