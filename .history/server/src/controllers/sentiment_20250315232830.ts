import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { GeminiClient } from '../services/gemini/client';
import { SentimentAnalyzer, ReviewData } from '../services/sentiment/analyzer';

export class SentimentController {
  private analyzer: SentimentAnalyzer;

  constructor(
    geminiApiKey: string,
    redisClient: Redis
  ) {
    const gemini = new GeminiClient({
      apiKey: geminiApiKey,
      maxRetries: 3,
      retryDelay: 1000
    });
    this.analyzer = new SentimentAnalyzer(gemini, redisClient);
  }

  async analyzeSingleReview(req: Request, res: Response): Promise<void> {
    try {
      const { id, text } = req.body;

      if (!id || !text) {
        res.status(400).json({
          error: 'Missing required fields: id and text are required'
        });
        return;
      }

      const review: ReviewData = {
        id,
        text,
        createdAt: new Date()
      };

      const analysis = await this.analyzer.analyzeReview(review);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing review:', error);
      res.status(500).json({
        error: 'Failed to analyze review'
      });
    }
  }

  async analyzeBusinessReviews(req: Request, res: Response): Promise<void> {
    try {
      const { placeId } = req.params;
      const { timeRange } = req.query;

      // In a real implementation, you would fetch reviews from your database
      // based on placeId and timeRange
      const reviews: ReviewData[] = []; // Fetch from database
      
      const analyses = await this.analyzer.batchAnalyze(reviews);
      const stats = await this.analyzer.calculateStats(analyses);

      res.json({
        placeId,
        timeRange,
        stats,
        analyses
      });
    } catch (error) {
      console.error('Error analyzing business reviews:', error);
      res.status(500).json({
        error: 'Failed to analyze business reviews'
      });
    }
  }

  async getBatchAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const reviews = req.body.reviews;

      if (!Array.isArray(reviews) || reviews.length === 0) {
        res.status(400).json({
          error: 'Invalid request: reviews must be a non-empty array'
        });
        return;
      }

      const reviewData: ReviewData[] = reviews.map(review => ({
        id: review.id,
        text: review.text,
        createdAt: new Date(review.createdAt || Date.now())
      }));

      const analyses = await this.analyzer.batchAnalyze(reviewData);
      const stats = await this.analyzer.calculateStats(analyses);

      res.json({
        stats,
        analyses
      });
    } catch (error) {
      console.error('Error processing batch analysis:', error);
      res.status(500).json({
        error: 'Failed to process batch analysis'
      });
    }
  }

  async getReviewStats(req: Request, res: Response): Promise<void> {
    try {
      const { placeId } = req.params;
      const { 
        startDate,
        endDate,
        sentiment
      } = req.query;

      // Validate date parameters
      const start = startDate ? new Date(startDate as string) : new Date(0);
      const end = endDate ? new Date(endDate as string) : new Date();

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          error: 'Invalid date format'
        });
        return;
      }

      // In a real implementation, fetch reviews from database with filters
      const reviews: ReviewData[] = []; // Fetch from database

      const analyses = await this.analyzer.batchAnalyze(reviews);
      
      // Filter by sentiment if specified
      const filteredAnalyses = sentiment 
        ? analyses.filter(a => a.sentiment === sentiment)
        : analyses;

      const stats = await this.analyzer.calculateStats(filteredAnalyses);

      res.json({
        placeId,
        dateRange: { start, end },
        sentiment,
        stats
      });
    } catch (error) {
      console.error('Error fetching review stats:', error);
      res.status(500).json({
        error: 'Failed to fetch review stats'
      });
    }
  }
}