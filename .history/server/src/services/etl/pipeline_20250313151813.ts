import { LanguageServiceClient } from '@google-cloud/language';
import { ReviewData } from '../data-collection/base';
import { config, supabase } from '../../config';
import { queues } from '../../config';
import { ProcessedReview, AlertType } from '../../types';
import { alertSystem } from '../alerts/instance';
import { notificationService } from '../notifications';

export class ETLPipeline {
  private languageClient: LanguageServiceClient;

  constructor() {
    this.languageClient = new LanguageServiceClient({
      credentials: {
        client_email: config.apis.google.serviceAccount.clientEmail,
        private_key: config.apis.google.serviceAccount.privateKey,
      },
    });
  }

  async processReviews(reviews: ReviewData[], entityId: string): Promise<ProcessedReview[]> {
    const processedReviews = await Promise.all(
      reviews.map(async (review) => {
        const sentiment = await this.analyzeSentiment(review.content);
        const themes = await this.extractThemes(review.content);

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

    await this.saveProcessedReviews(processedReviews);
    return processedReviews;
  }

  async checkAlerts(entityId: string, type: AlertType): Promise<void> {
    const { data: alert } = await supabase
      .from('alerts')
      .select('*')
      .eq('entity_id', entityId)
      .eq('type', type)
      .eq('active', true)
      .single();

    if (alert) {
      const shouldTrigger = await alertSystem.processAlert(alert);
      if (shouldTrigger) {
        await notificationService.sendAlertNotification(alert, entityId);
      }
    }
  }

  private async analyzeSentiment(text: string) {
    if (!text) {
      return { score: 0, magnitude: 0, analysis: {} };
    }

    try {
      const [result] = await this.languageClient.analyzeSentiment({
        document: {
          content: text,
          type: 'PLAIN_TEXT',
        },
      });

      return {
        score: result.documentSentiment?.score || 0,
        magnitude: result.documentSentiment?.magnitude || 0,
        analysis: {
          sentences: result.sentences?.map((s) => ({
            text: s.text?.content,
            sentiment: {
              score: s.sentiment?.score,
              magnitude: s.sentiment?.magnitude,
            },
          })),
        },
      };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { score: 0, magnitude: 0, analysis: {} };
    }
  }

  private async extractThemes(text: string) {
    if (!text) return [];

    try {
      const [result] = await this.languageClient.classifyText({
        document: {
          content: text,
          type: 'PLAIN_TEXT',
        },
      });

      return (result.categories || []).map((category) => ({
        category: this.normalizeCategory(category.name || ''),
        sentiment: category.confidence || 0,
        frequency: 1,
      }));
    } catch (error) {
      console.error('Error extracting themes:', error);
      return [];
    }
  }

  private normalizeCategory(category: string): string {
    return category.split('/').pop() || category;
  }

  private async saveProcessedReviews(reviews: ProcessedReview[]): Promise<void> {
    if (!reviews.length) return;

    const { error } = await supabase.from('processed_reviews').insert(
      reviews.map((review) => ({
        id: review.id,
        entity_id: review.entityId,
        content: review.content,
        rating: review.rating,
        platform: review.platform,
        created_at: review.createdAt,
        sentiment_score: review.sentiment.score,
        sentiment_magnitude: review.sentiment.magnitude,
        sentiment_analysis: review.sentiment.analysis,
        themes: review.themes,
      }))
    );

    if (error) {
      console.error('Error saving processed reviews:', error);
      throw error;
    }
  }

  async addToQueue(reviews: ReviewData[], entityId: string): Promise<void> {
    await queues.etl.add({
      reviews,
      entityId,
    });
  }
}

// Export singleton instance
export const etlPipeline = new ETLPipeline();