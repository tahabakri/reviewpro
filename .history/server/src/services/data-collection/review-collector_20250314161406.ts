import { Client } from '@googlemaps/google-maps-services-js';
import { EventEmitter } from 'events';
import { SentimentAnalyzer } from '../sentiment/analyzer';
import { Redis } from 'ioredis';
import {
  ReviewUpdate,
  AnalyzedReviewUpdate,
  ReviewCollectorOptions,
  GoogleMapsReview
} from './types';

export class ReviewCollector extends EventEmitter {
  private mapsClient: Client;
  private redis: Redis;
  private analyzer: SentimentAnalyzer;
  private collectionInterval: NodeJS.Timeout | null = null;

  constructor(
    private apiKey: string,
    redis: Redis,
    analyzer: SentimentAnalyzer,
    private options: ReviewCollectorOptions = {
      interval: 30000, // 30 seconds
      maxRetries: 3,
      retryDelay: 1000,
    }
  ) {
    super();
    this.mapsClient = new Client({});
    this.redis = redis;
    this.analyzer = analyzer;
  }

  async startCollecting(placeId: string): Promise<void> {
    // Stop any existing collection
    this.stopCollecting();

    // Initialize last check time
    const lastCheckKey = `review:lastCheck:${placeId}`;
    let lastCheckTime = await this.redis.get(lastCheckKey);
    
    if (!lastCheckTime) {
      lastCheckTime = Date.now().toString();
      await this.redis.set(lastCheckKey, lastCheckTime);
    }

    // Start periodic collection
    this.collectionInterval = setInterval(async () => {
      try {
        const updates = await this.collectNewReviews(placeId, parseInt(lastCheckTime));
        
        if (updates.length > 0) {
          // Process reviews in parallel
          const analysisPromises = updates.map(async update => {
            const sentiment = await this.analyzer.analyzeReview({
              id: update.reviewId,
              text: update.text,
              createdAt: new Date(update.time)
            });

            const analyzedUpdate: AnalyzedReviewUpdate = {
              ...update,
              sentiment
            };

            return analyzedUpdate;
          });

          const analyzedUpdates = await Promise.all(analysisPromises);

          // Cache the results
          await Promise.all(
            analyzedUpdates.map(update => 
              this.redis.setex(
                `review:${update.reviewId}`,
                86400, // 24 hours
                JSON.stringify(update)
              )
            )
          );

          // Emit updates
          this.emit('reviews', analyzedUpdates);

          // Update last check time
          const newLastCheckTime = Date.now();
          await this.redis.set(lastCheckKey, newLastCheckTime.toString());
        }
      } catch (error) {
        this.emit('error', error);
      }
    }, this.options.interval);
  }

  stopCollecting(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
  }

  private async collectNewReviews(
    placeId: string,
    lastCheckTime: number
  ): Promise<ReviewUpdate[]> {
    let retries = 0;
    
    while (retries < this.options.maxRetries) {
      try {
        const response = await this.mapsClient.placeDetails({
          params: {
            place_id: placeId,
            key: this.apiKey,
            fields: ['reviews'],
          },
        });

        const reviews = response.data.result?.reviews as GoogleMapsReview[] | undefined;
        if (!reviews) {
          return [];
        }

        // Filter and map new or updated reviews
        const updates = reviews
          .filter(review => (review.time * 1000) > lastCheckTime)
          .map(review => ({
            placeId,
            reviewId: `${placeId}:${review.time}:${review.author_name}`,
            text: review.text,
            rating: review.rating,
            time: review.time * 1000,
            authorName: review.author_name,
            language: review.language || 'en'
          }));

        return updates;
      } catch (error) {
        retries++;
        if (retries === this.options.maxRetries) {
          throw error;
        }
        await new Promise(resolve => 
          setTimeout(resolve, this.options.retryDelay * retries)
        );
      }
    }

    return [];
  }

  // Subscribe to review updates
  onReviews(callback: (updates: AnalyzedReviewUpdate[]) => void): void {
    this.on('reviews', callback);
  }

  // Subscribe to errors
  onError(callback: (error: Error) => void): void {
    this.on('error', callback);
  }
}

// WebSocket event types
export interface ReviewWebSocketEvents {
  'review.new': AnalyzedReviewUpdate;
  'review.error': { message: string };
}