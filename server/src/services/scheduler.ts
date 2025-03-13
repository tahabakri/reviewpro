import { CronJob } from 'cron';
import { supabase } from '../config';
import { queues } from '../config';
import { GooglePlacesService } from './data-collection/google-places';
import { YelpService } from './data-collection/yelp';
import { TripAdvisorService } from './data-collection/tripadvisor';
import { etlPipeline } from './etl/pipeline';
import { Alert, AlertType, AlertConditions, DataCollector } from '../types';

interface SchedulerConfig {
  dataCollectionInterval: string; // cron expression
  alertCheckInterval: string; // cron expression
}

export class SchedulerService {
  private dataCollectionJob: CronJob;
  private alertCheckJob: CronJob;
  private dataCollectors: Map<string, DataCollector>;

  constructor(config: SchedulerConfig) {
    this.dataCollectors = new Map<string, DataCollector>();
    this.dataCollectors.set('google', new GooglePlacesService());
    this.dataCollectors.set('yelp', new YelpService());
    this.dataCollectors.set('tripadvisor', new TripAdvisorService());

    this.dataCollectionJob = new CronJob(
      config.dataCollectionInterval,
      this.runDataCollection.bind(this),
      null,
      false,
      'UTC'
    );

    this.alertCheckJob = new CronJob(
      config.alertCheckInterval,
      this.checkAlerts.bind(this),
      null,
      false,
      'UTC'
    );
  }

  start(): void {
    this.dataCollectionJob.start();
    this.alertCheckJob.start();
    console.log('Scheduler started');
  }

  stop(): void {
    this.dataCollectionJob.stop();
    this.alertCheckJob.stop();
    console.log('Scheduler stopped');
  }

  private async runDataCollection(): Promise<void> {
    try {
      const { data: competitors } = await supabase
        .from('competitors')
        .select('*');

      if (!competitors) return;

      for (const competitor of competitors) {
        const collector = this.dataCollectors.get(competitor.platform);
        if (!collector) continue;

        try {
          const reviews = await collector.getReviews(competitor.externalId);
          await etlPipeline.addToQueue(reviews, competitor.id);
        } catch (error) {
          console.error(`Failed to collect data for competitor ${competitor.id}:`, error);
          await this.createAlert({
            businessId: competitor.business_id,
            type: 'data_collection_error',
            conditions: {
              competitorId: competitor.id,
              platform: competitor.platform,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });
        }
      }
    } catch (error) {
      console.error('Data collection job failed:', error);
    }
  }

  private async checkAlerts(): Promise<void> {
    try {
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('active', true);

      if (!alerts) return;

      for (const alert of alerts) {
        try {
          const shouldTrigger = await this.evaluateAlertConditions(alert);
          if (shouldTrigger) {
            await this.triggerAlert(alert);
          }
        } catch (error) {
          console.error(`Failed to process alert ${alert.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Alert check job failed:', error);
    }
  }

  private async evaluateAlertConditions(alert: Alert): Promise<boolean> {
    const { type, conditions } = alert;

    switch (type as AlertType) {
      case 'rating_threshold': {
        if (!conditions.competitorId || !conditions.threshold) return false;

        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('entity_id', conditions.competitorId)
          .order('created_at', { ascending: false })
          .limit(conditions.sampleSize || 10);

        if (!reviews?.length) return false;

        const avgRating = reviews.reduce<number>((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
        return avgRating <= conditions.threshold;
      }

      case 'review_volume': {
        if (!conditions.competitorId || !conditions.threshold || !conditions.timeWindow) return false;

        const { count } = await supabase
          .from('reviews')
          .select('id', { count: 'exact' })
          .eq('entity_id', conditions.competitorId)
          .gte('created_at', new Date(Date.now() - conditions.timeWindow).toISOString());

        return Boolean(count && count >= conditions.threshold);
      }

      case 'sentiment_drop': {
        if (!conditions.competitorId || !conditions.threshold) return false;

        const { data: sentiments } = await supabase
          .from('sentiments')
          .select('score')
          .eq('entity_id', conditions.competitorId)
          .order('created_at', { ascending: false })
          .limit(conditions.sampleSize || 10);

        if (!sentiments?.length) return false;

        const avgSentiment = sentiments.reduce((sum: number, s: { score: number }) => sum + s.score, 0) / sentiments.length;
        return avgSentiment <= conditions.threshold;
      }

      default:
        return false;
    }
  }

  private async triggerAlert(alert: Alert): Promise<void> {
    await queues.etl.add('send-notification', {
      alertId: alert.id,
      businessId: alert.business_id,
      type: alert.type,
      conditions: alert.conditions,
    });

    if (alert.conditions.oneTime) {
      await supabase
        .from('alerts')
        .update({ active: false })
        .eq('id', alert.id);
    }
  }

  private async createAlert(data: {
    businessId: string;
    type: AlertType;
    conditions: AlertConditions;
  }): Promise<void> {
    await supabase.from('alerts').insert([
      {
        business_id: data.businessId,
        type: data.type,
        conditions: data.conditions,
        active: true,
      },
    ]);
  }
}

// Create singleton instance with default configuration
export const scheduler = new SchedulerService({
  dataCollectionInterval: '0 */6 * * *', // Every 6 hours
  alertCheckInterval: '*/15 * * * *', // Every 15 minutes
});