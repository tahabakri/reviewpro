import { Router, Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';
import { SentimentController } from '../controllers/sentiment';
import { GeminiError } from '../services/gemini/error';

export function createSentimentRouter(geminiApiKey: string, redisClient: Redis): Router {
  const router = Router();
  const controller = new SentimentController(geminiApiKey, redisClient);

  /**
   * @route POST /api/sentiment/analyze
   * @description Analyze sentiment for a single review
   * @body {id: string, text: string}
   */
  router.post('/analyze', controller.analyzeSingleReview.bind(controller));

  /**
   * @route GET /api/sentiment/places/:placeId
   * @description Get sentiment analysis for all reviews of a business
   * @param placeId Business identifier
   * @query timeRange Optional time range filter
   */
  router.get('/places/:placeId', controller.analyzeBusinessReviews.bind(controller));

  /**
   * @route POST /api/sentiment/batch
   * @description Analyze sentiment for multiple reviews
   * @body {reviews: Array<{id: string, text: string, createdAt?: string}>}
   */
  router.post('/batch', controller.getBatchAnalysis.bind(controller));

  /**
   * @route GET /api/sentiment/stats/:placeId
   * @description Get sentiment statistics for a business
   * @param placeId Business identifier
   * @query startDate Optional start date filter
   * @query endDate Optional end date filter
   * @query sentiment Optional sentiment filter (positive|negative|neutral)
   */
  router.get('/stats/:placeId', controller.getReviewStats.bind(controller));

  return router;
}

interface SentimentError extends Error {
  status?: number;
  code?: string;
}

// Error handling middleware
export function sentimentErrorHandler(
  err: SentimentError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Sentiment Analysis Error:', err);
  
  if (err instanceof GeminiError) {
    res.status(500).json({
      error: 'Sentiment analysis service temporarily unavailable',
      details: err.message
    });
    return;
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });

  next(err);
}