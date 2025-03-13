import { Router, Request, Response } from 'express';
import { supabase } from '../config';
import { DataCollectionError } from '../services/data-collection/base';

const router = Router();

// Get reviews for a competitor
router.get('/competitor/:competitorId', async (req: Request, res: Response) => {
  try {
    const { competitorId } = req.params;
    const { timeframe, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('reviews')
      .select(`
        *,
        sentiments (*),
        themes (*)
      `)
      .eq('entity_id', competitorId)
      .order('created_at', { ascending: false });

    // Apply timeframe filter if provided
    if (timeframe) {
      const date = new Date();
      switch (timeframe) {
        case 'day':
          date.setDate(date.getDate() - 1);
          break;
        case 'week':
          date.setDate(date.getDate() - 7);
          break;
        case 'month':
          date.setMonth(date.getMonth() - 1);
          break;
        case 'year':
          date.setFullYear(date.getFullYear() - 1);
          break;
      }
      query = query.gte('created_at', date.toISOString());
    }

    // Apply pagination
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    query = query.range(start, end);

    const { data: reviews, error, count } = await query;

    if (error) throw error;

    res.json({
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: count ? Math.ceil(count / Number(limit)) : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get sentiment analysis for reviews
router.get('/sentiment/:competitorId', async (req: Request, res: Response) => {
  try {
    const { competitorId } = req.params;
    const { timeframe } = req.query;

    let query = supabase
      .from('sentiments')
      .select('score, created_at')
      .eq('entity_id', competitorId)
      .order('created_at', { ascending: true });

    if (timeframe) {
      const date = new Date();
      switch (timeframe) {
        case 'week':
          date.setDate(date.getDate() - 7);
          break;
        case 'month':
          date.setMonth(date.getMonth() - 1);
          break;
        case 'year':
          date.setFullYear(date.getFullYear() - 1);
          break;
      }
      query = query.gte('created_at', date.toISOString());
    }

    const { data: sentiments, error } = await query;

    if (error) throw error;

    // Calculate sentiment trends
    const trends = sentiments.reduce((acc: Record<string, number[]>, curr) => {
      const date = new Date(curr.created_at).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(curr.score);
      return acc;
    }, {});

    // Calculate daily averages
    const averages = Object.entries(trends).map(([date, scores]) => ({
      date,
      score: scores.reduce((sum, score) => sum + score, 0) / scores.length,
    }));

    res.json({
      trends: averages.sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (error) {
    console.error('Error fetching sentiment analysis:', error);
    res.status(500).json({ error: 'Failed to fetch sentiment analysis' });
  }
});

// Get common themes from reviews
router.get('/themes/:competitorId', async (req: Request, res: Response) => {
  try {
    const { competitorId } = req.params;
    const { limit = 10 } = req.query;

    const { data: themes, error } = await supabase
      .from('themes')
      .select('category, sentiment, frequency')
      .eq('entity_id', competitorId)
      .order('frequency', { ascending: false })
      .limit(Number(limit));

    if (error) throw error;

    // Aggregate themes by category
    const aggregatedThemes = themes.reduce((acc: Record<string, any>, theme) => {
      if (!acc[theme.category]) {
        acc[theme.category] = {
          category: theme.category,
          total_frequency: 0,
          average_sentiment: 0,
          mentions: 0,
        };
      }

      acc[theme.category].total_frequency += theme.frequency;
      acc[theme.category].average_sentiment += theme.sentiment * theme.frequency;
      acc[theme.category].mentions += 1;

      return acc;
    }, {} as Record<string, {
      category: string;
      total_frequency: number;
      average_sentiment: number;
      mentions: number;
    }>);

    // Calculate final averages
    const result = Object.values(aggregatedThemes).map((theme) => ({
      ...theme,
      average_sentiment: theme.average_sentiment / theme.total_frequency,
    }));

    res.json({
      themes: result.sort((a, b) => b.total_frequency - a.total_frequency),
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    if (error instanceof DataCollectionError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch themes' });
    }
  }
});

export default router;