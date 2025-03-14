import { supabase, queues } from '../../config';
import { DataCollectionService } from '../data-collection/base';
import { googlePlacesService } from '../data-collection/google-places';
import { yelpService } from '../data-collection/yelp';
import { tripadvisorService } from '../data-collection/tripadvisor';
import { monitoring } from '../../monitoring';
import { alertSystem } from '../alerts/instance';

type ServiceMap = {
  [key: string]: DataCollectionService;
};

const services: ServiceMap = {
  google: googlePlacesService,
  yelp: yelpService,
  tripadvisor: tripadvisorService,
};

export class Scheduler {
  private runningJobs: Set<string> = new Set();

  async scheduleDataCollection(businessId: string, competitors: string[]) {
    const jobId = `data-collection-${businessId}-${Date.now()}`;
    if (this.runningJobs.has(jobId)) {
      console.log(`Job ${jobId} is already running`);
      return;
    }

    this.runningJobs.add(jobId);
    try {
      await this.collectData(businessId, competitors);
    } finally {
      this.runningJobs.delete(jobId);
    }
  }

  private async collectData(businessId: string, competitors: string[]) {
    const platforms = Object.keys(services);

    for (const competitor of competitors) {
      for (const platform of platforms) {
        try {
          const service = services[platform];
          await queues.dataCollection.add({
            service,
            method: 'getReviews',
            params: [competitor],
          });

          monitoring.trackDataCollection(platform, 'success');
        } catch (error) {
          console.error(`Error queueing data collection for ${competitor} on ${platform}:`, error);
          monitoring.trackDataCollection(platform, 'error');

          await alertSystem.createAlert({
            businessId,
            type: 'data_collection_error',
            conditions: {
              competitorId: competitor,
              platform,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });
        }
      }
    }
  }

  async scheduleAlertCheck(businessId: string) {
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('business_id', businessId)
      .eq('active', true);

    if (!alerts?.length) return;

    for (const alert of alerts) {
      await queues.alerts.add({
        type: 'check',
        alert,
      });
    }
  }

  async scheduleSentimentAnalysis(businessId: string) {
    const { data: competitors } = await supabase
      .from('competitors')
      .select('id')
      .eq('business_id', businessId);

    if (!competitors?.length) return;

    const competitorIds = competitors.map(c => c.id);
    const lastAnalysis = new Date();
    lastAnalysis.setHours(lastAnalysis.getHours() - 24); // Last 24 hours

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .in('entity_id', competitorIds)
      .gt('created_at', lastAnalysis.toISOString())
      .is('sentiment_score', null);

    if (!reviews?.length) return;

    await queues.sentiment.add({
      reviews,
      entityId: businessId,
    });
  }

  async startScheduler() {
    // Schedule periodic tasks
    setInterval(() => this.runPeriodicTasks(), 15 * 60 * 1000); // Every 15 minutes

    // Start processing queues
    this.startQueueProcessing();
  }

  private async runPeriodicTasks() {
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, competitor_refresh_interval')
      .eq('active', true);

    if (!businesses?.length) return;

    for (const business of businesses) {
      const lastUpdate = await this.getLastUpdate(business.id);
      const shouldUpdate = this.shouldRefreshData(
        lastUpdate,
        business.competitor_refresh_interval
      );

      if (shouldUpdate) {
        const { data: competitors } = await supabase
          .from('competitors')
          .select('id')
          .eq('business_id', business.id);

        if (competitors?.length) {
          await this.scheduleDataCollection(
            business.id,
            competitors.map(c => c.id)
          );
        }
      }

      await this.scheduleAlertCheck(business.id);
      await this.scheduleSentimentAnalysis(business.id);
    }
  }

  private startQueueProcessing() {
    // Queue processing is handled in worker.ts
    console.log('Queue processing started');
  }

  private async getLastUpdate(businessId: string): Promise<Date | null> {
    const { data } = await supabase
      .from('data_collection_logs')
      .select('created_at')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data ? new Date(data.created_at) : null;
  }

  private shouldRefreshData(lastUpdate: Date | null, interval: number): boolean {
    if (!lastUpdate) return true;

    const now = new Date();
    const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    return diffHours >= interval;
  }
}

// Export singleton instance
export const scheduler = new Scheduler();