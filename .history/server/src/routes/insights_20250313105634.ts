import { Router, Request, Response } from 'express';
import { supabase } from '../config';

const router = Router();

// Get competitor performance metrics
router.get('/performance/:businessId', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { timeframe = '30' } = req.query;

    const date = new Date();
    date.setDate(date.getDate() - Number(timeframe));

    // Get all competitors for the business
    const { data: competitors } = await supabase
      .from('competitors')
      .select('id, name')
      .eq('business_id', businessId);

    if (!competitors) {
      return res.json({ competitors: [] });
    }

    // Get performance metrics for each competitor
    const competitorMetrics = await Promise.all(
      competitors.map(async (competitor) => {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating, created_at')
          .eq('entity_id', competitor.id)
          .gte('created_at', date.toISOString());

        const { data: sentiments } = await supabase
          .from('sentiments')
          .select('score')
          .eq('entity_id', competitor.id)
          .gte('created_at', date.toISOString());

        const avgRating = reviews?.length
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;

        const avgSentiment = sentiments?.length
          ? sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length
          : 0;

        return {
          id: competitor.id,
          name: competitor.name,
          metrics: {
            review_count: reviews?.length || 0,
            average_rating: Number(avgRating.toFixed(2)),
            sentiment_score: Number(avgSentiment.toFixed(2)),
          },
        };
      })
    );

    res.json({ competitors: competitorMetrics });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Get trend analysis
router.get('/trends/:businessId', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { metric = 'rating', interval = 'day' } = req.query;

    const { data: competitors } = await supabase
      .from('competitors')
      .select('id, name')
      .eq('business_id', businessId);

    if (!competitors) {
      return res.json({ trends: [] });
    }

    const trends = await Promise.all(
      competitors.map(async (competitor) => {
        let data;
        
        if (metric === 'sentiment') {
          const { data: sentiments } = await supabase
            .from('sentiments')
            .select('score, created_at')
            .eq('entity_id', competitor.id)
            .order('created_at', { ascending: true });
          data = sentiments;
        } else {
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating, created_at')
            .eq('entity_id', competitor.id)
            .order('created_at', { ascending: true });
          data = reviews;
        }

        if (!data) return null;

        // Group by interval
        const groupedData = data.reduce((acc: Record<string, number[]>, item) => {
          let key;
          const date = new Date(item.created_at);
          
          switch (interval) {
            case 'week':
              key = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
              break;
            case 'month':
              key = date.toISOString().slice(0, 7); // YYYY-MM
              break;
            default: // day
              key = date.toISOString().slice(0, 10); // YYYY-MM-DD
          }

          if (!acc[key]) acc[key] = [];
          acc[key].push(metric === 'sentiment' ? item.score : item.rating);
          return acc;
        }, {});

        // Calculate averages
        const averages = Object.entries(groupedData).map(([period, values]) => ({
          period,
          value: Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(2)),
        }));

        return {
          competitor_id: competitor.id,
          name: competitor.name,
          trend: averages.sort((a, b) => a.period.localeCompare(b.period)),
        };
      })
    );

    res.json({
      trends: trends.filter(Boolean),
      metric,
      interval,
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

export default router;