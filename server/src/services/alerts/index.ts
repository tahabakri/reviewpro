import { supabase } from '../../config';
import { Alert, AlertType } from '../../types';

export class AlertSystem {
  async processAlert(alert: Alert): Promise<boolean> {
    switch (alert.type) {
      case 'rating_threshold':
        return await this.checkRatingThreshold(alert);
      case 'review_volume':
        return await this.checkReviewVolume(alert);
      case 'sentiment_drop':
        return await this.checkSentimentDrop(alert);
      default:
        return false;
    }
  }

  async checkRatingThreshold(alert: Alert): Promise<boolean> {
    const { competitorId, threshold, sampleSize = 10 } = alert.conditions;

    if (!competitorId || !threshold) return false;

    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('entity_id', competitorId)
      .order('created_at', { ascending: false })
      .limit(sampleSize);

    if (!reviews?.length) return false;

    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    return avgRating <= threshold;
  }

  async checkReviewVolume(alert: Alert): Promise<boolean> {
    const { competitorId, threshold, timeWindow } = alert.conditions;

    if (!competitorId || !threshold || !timeWindow) return false;

    const cutoffDate = new Date(Date.now() - timeWindow);

    const { count } = await supabase
      .from('reviews')
      .select('id', { count: 'exact' })
      .eq('entity_id', competitorId)
      .gte('created_at', cutoffDate.toISOString());

    return Boolean(count && count >= threshold);
  }

  async checkSentimentDrop(alert: Alert): Promise<boolean> {
    const { competitorId, threshold, sampleSize = 10 } = alert.conditions;

    if (!competitorId || !threshold) return false;

    const { data: sentiments } = await supabase
      .from('sentiments')
      .select('score')
      .eq('entity_id', competitorId)
      .order('created_at', { ascending: false })
      .limit(sampleSize);

    if (!sentiments?.length) return false;

    const avgSentiment = sentiments.reduce((sum, sentiment) => sum + sentiment.score, 0) / sentiments.length;
    return avgSentiment <= threshold;
  }

  async createAlert(data: {
    businessId: string;
    type: AlertType;
    conditions: Record<string, unknown>;
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

  async updateAlertStatus(alertId: string, active: boolean): Promise<void> {
    await supabase
      .from('alerts')
      .update({ active })
      .eq('id', alertId);
  }

  async getActiveAlerts(businessId: string): Promise<Alert[]> {
    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .eq('business_id', businessId)
      .eq('active', true);

    return alerts || [];
  }
}