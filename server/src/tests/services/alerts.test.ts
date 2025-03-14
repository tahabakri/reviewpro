import { AlertSystem } from '../../services/alerts';
import { alertSystem } from '../../services/alerts/instance';
import { supabase } from '../../config';
import { Alert, AlertType } from '../../types';

jest.mock('../../config', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  },
}));

describe('AlertSystem', () => {
  let system: AlertSystem;
  const mockAlert: Alert = {
    id: 'test-alert-1',
    business_id: 'business-1',
    type: 'rating_threshold' as AlertType,
    conditions: {
      competitorId: 'competitor-1',
      threshold: 3.5,
      sampleSize: 10,
    },
    active: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    system = new AlertSystem();
  });

  describe('checkRatingThreshold', () => {
    it('should trigger alert when rating drops below threshold', async () => {
      const mockReviews = [
        { rating: 3.0 },
        { rating: 3.0 },
        { rating: 3.0 },
      ];

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce({ data: mockReviews }),
      }));

      const result = await system.checkRatingThreshold(mockAlert);
      expect(result).toBe(true);
    });

    it('should not trigger alert when rating is above threshold', async () => {
      const mockReviews = [
        { rating: 4.0 },
        { rating: 4.0 },
        { rating: 4.0 },
      ];

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce({ data: mockReviews }),
      }));

      const result = await system.checkRatingThreshold(mockAlert);
      expect(result).toBe(false);
    });
  });

  describe('checkReviewVolume', () => {
    const volumeAlert: Alert = {
      ...mockAlert,
      type: 'review_volume',
      conditions: {
        competitorId: 'competitor-1',
        threshold: 5,
        timeWindow: 24 * 60 * 60 * 1000, // 24 hours
      },
    };

    it('should trigger alert when review volume exceeds threshold', async () => {
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce({ count: 6 }),
      }));

      const result = await system.checkReviewVolume(volumeAlert);
      expect(result).toBe(true);
    });

    it('should not trigger alert when review volume is below threshold', async () => {
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce({ count: 3 }),
      }));

      const result = await system.checkReviewVolume(volumeAlert);
      expect(result).toBe(false);
    });
  });

  describe('checkSentimentDrop', () => {
    const sentimentAlert: Alert = {
      ...mockAlert,
      type: 'sentiment_drop',
      conditions: {
        competitorId: 'competitor-1',
        threshold: 0.3,
        sampleSize: 10,
      },
    };

    it('should trigger alert when sentiment drops below threshold', async () => {
      const mockSentiments = [
        { score: 0.2 },
        { score: 0.2 },
        { score: 0.2 },
      ];

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce({ data: mockSentiments }),
      }));

      const result = await system.checkSentimentDrop(sentimentAlert);
      expect(result).toBe(true);
    });

    it('should not trigger alert when sentiment is above threshold', async () => {
      const mockSentiments = [
        { score: 0.5 },
        { score: 0.5 },
        { score: 0.5 },
      ];

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce({ data: mockSentiments }),
      }));

      const result = await system.checkSentimentDrop(sentimentAlert);
      expect(result).toBe(false);
    });
  });

  describe('Alert Management', () => {
    describe('createAlert', () => {
      it('should create a new alert', async () => {
        const mockInsert = jest.fn().mockResolvedValueOnce({ data: mockAlert });
        (supabase.from as jest.Mock).mockImplementationOnce(() => ({
          insert: mockInsert,
        }));

        await system.createAlert({
          businessId: 'business-1',
          type: 'rating_threshold',
          conditions: {
            competitorId: 'competitor-1',
            threshold: 3.5,
          },
        });

        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({
            business_id: 'business-1',
            type: 'rating_threshold',
            conditions: expect.any(Object),
            active: true,
          }),
        ]);
      });
    });

    describe('updateAlertStatus', () => {
      it('should update alert status', async () => {
        const mockUpdate = jest.fn().mockResolvedValueOnce({ data: null });
        (supabase.from as jest.Mock).mockImplementationOnce(() => ({
          update: mockUpdate,
          eq: jest.fn().mockReturnThis(),
        }));

        await system.updateAlertStatus('test-alert-1', false);

        expect(mockUpdate).toHaveBeenCalledWith({ active: false });
      });
    });

    describe('getActiveAlerts', () => {
      it('should return active alerts for a business', async () => {
        const mockAlerts = [mockAlert];
        (supabase.from as jest.Mock).mockImplementationOnce(() => ({
          select: jest.fn().mockResolvedValueOnce({ data: mockAlerts }),
          eq: jest.fn().mockReturnThis(),
        }));

        const alerts = await system.getActiveAlerts('business-1');

        expect(alerts).toEqual(mockAlerts);
      });

      it('should return empty array when no alerts found', async () => {
        (supabase.from as jest.Mock).mockImplementationOnce(() => ({
          select: jest.fn().mockResolvedValueOnce({ data: null }),
          eq: jest.fn().mockReturnThis(),
        }));

        const alerts = await system.getActiveAlerts('business-1');

        expect(alerts).toEqual([]);
      });
    });
  });

  describe('Singleton Instance', () => {
    it('should provide a singleton instance', () => {
      expect(alertSystem).toBeInstanceOf(AlertSystem);
    });

    it('should share state across imports', () => {
      const anotherSystemReference = alertSystem;
      expect(anotherSystemReference).toBe(alertSystem);
    });
  });
});