import { LanguageServiceClient } from '@google-cloud/language';
import { ReviewData } from '../data-collection/base';
import { config } from '../../config';
import { queues } from '../../config';

interface ProcessedReview {
  id: string;
  entityId: string;
  rating: number;
  content: string;
  platform: string;
  createdAt: string;
  sentiment: {
    score: number;
    magnitude: number;
    analysis: Record<string, unknown>;
  };
  themes: Array<{
    category: string;
    sentiment: number;
    frequency: number;
  }>;
}

export class ETLPipeline {
  private languageClient: LanguageServiceClient;

  constructor() {
    this.languageClient = new LanguageServiceClient({
      credentials: {
        client_email: config.apis.google.serviceAccount.clientEmail,
        private_key: config.apis.google.serviceAccount.privateKey,
      },
    });

    this.setupQueueProcessors();
  }

  private setupQueueProcessors() {
    queues.etl.process(async (job) => {
      const { reviews, entityId } = job.data;
      return await this.processReviews(reviews, entityId);
    });
  }

  async processReviews(reviews: ReviewData[], entityId: string): Promise<ProcessedReview[]> {
    return await Promise.all(
      reviews.map(async (review) => {
        const [sentiment, themes] = await Promise.all([
          this.analyzeSentiment(review.content),
          this.extractThemes(review.content),
        ]);

        return {
          id: review.id,
          entityId,
          rating: review.rating,
          content: review.content,
          platform: review.platform,
          createdAt: review.created_at,
          sentiment,
          themes,
        };
      })
    );
  }

  private async analyzeSentiment(text: string) {
    try {
      const [result] = await this.languageClient.analyzeSentiment({
        document: {
          content: text,
          type: 'PLAIN_TEXT' as const,
        },
      });

      const sentiment = result.documentSentiment;
      if (!sentiment) {
        throw new Error('No sentiment analysis result');
      }

      return {
        score: sentiment.score || 0,
        magnitude: sentiment.magnitude || 0,
        analysis: {
          sentences: result.sentences?.map((sentence) => ({
            text: sentence.text?.content,
            sentiment: {
              score: sentence.sentiment?.score,
              magnitude: sentence.sentiment?.magnitude,
            },
          })),
        },
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        score: 0,
        magnitude: 0,
        analysis: {},
      };
    }
  }

  private async extractThemes(text: string) {
    try {
      const [result] = await this.languageClient.classifyText({
        document: {
          content: text,
          type: 'PLAIN_TEXT' as const,
        },
      });

      const categories = result.categories || [];
      return categories.map((category) => ({
        category: category.name?.split('/').pop() || 'Unknown',
        sentiment: category.confidence || 0,
        frequency: 1,
      }));
    } catch (error) {
      console.error('Theme extraction error:', error);
      return [];
    }
  }

  async addToQueue(reviews: ReviewData[], entityId: string) {
    await queues.etl.add(
      'process-reviews',
      { reviews, entityId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      }
    );
  }
}

// Create singleton instance
export const etlPipeline = new ETLPipeline();