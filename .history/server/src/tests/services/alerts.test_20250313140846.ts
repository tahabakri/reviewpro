import { AlertSystem } from '../../services/alerts';
import { supabase } from '../../config';
import { Alert, AlertType } from '../../types';

jest.mock('../../config', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
  },
}));

describe('AlertSystem', () => {
  let alertSystem: AlertSystem;
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
    alertSystem = new AlertSystem();
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

      const result = await alertSystem.checkRatingThreshold(mockAlert);
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

      const result = await alertSystem.checkRatingThreshold(mockAlert);
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

      const result = await alertSystem.checkReviewVolume(volumeAlert);
      expect(result).toBe(true);
    });

    it('should not trigger alert when review volume is below threshold', async () => {
      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce({ count: 3 }),
      }));

      const result = await alertSystem.checkReviewVolume(volumeAlert);
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

      const result = await alertSystem.checkSentimentDrop(sentimentAlert);
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

      const result = await alertSystem.checkSentimentDrop(sentimentAlert);
      expect(result).toBe(false);
    });
  });

  describe('processAlert', () => {
    it('should handle rating threshold alerts', async () => {
      const mockProcessAlert = jest.spyOn(alertSystem, 'checkRatingThreshold');
      mockProcessAlert.mockResolvedValueOnce(true);

      const result = await alertSystem.processAlert(mockAlert);
      expect(result).toBe(true);
      expect(mockProcessAlert).toHaveBeenCalledWith(mockAlert);
    });

    it('should handle review volume alerts', async () => {
      const volumeAlert = { ...mockAlert, type: 'review_volume' as AlertType };
      const mockProcessAlert = jest.spyOn(alertSystem, 'checkReviewVolume');
      mockProcessAlert.mockResolvedValueOnce(true);

      const result = await alertSystem.processAlert(volumeAlert);
      expect(result).toBe(true);
      expect(mockProcessAlert).toHaveBeenCalledWith(volumeAlert);
    });

    it('should handle sentiment drop alerts', async () => {
      const sentimentAlert = { ...mockAlert, type: 'sentiment_drop' as AlertType };
      const mockProcessAlert = jest.spyOn(alertSystem, 'checkSentimentDrop');
      mockProcessAlert.mockResolvedValueOnce(true);

      const result = await alertSystem.processAlert(sentimentAlert);
      expect(result).toBe(true);
      expect(mockProcessAlert).toHaveBeenCalledWith(sentimentAlert);
    });

    it('should handle unknown alert types', async () => {
      const unknownAlert = { ...mockAlert, type: 'unknown' as AlertType };
      const result = await alertSystem.processAlert(unknownAlert);
      expect(result).toBe(false);
    });
  });
});