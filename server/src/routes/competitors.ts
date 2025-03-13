import { Router, Request, Response } from 'express';
import { supabase } from '../config';
import { GooglePlacesService } from '../services/data-collection/google-places';
import { YelpService } from '../services/data-collection/yelp';
import { TripAdvisorService } from '../services/data-collection/tripadvisor';
import { etlPipeline } from '../services/etl/pipeline';

const router = Router();
const dataCollectors = {
  google: new GooglePlacesService(),
  yelp: new YelpService(),
  tripadvisor: new TripAdvisorService(),
};

// Get all competitors for a business
router.get('/:businessId', async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { data: competitors, error } = await supabase
      .from('competitors')
      .select(`
        *,
        reviews (
          *,
          sentiments (*),
          themes (*)
        )
      `)
      .eq('business_id', businessId);

    if (error) throw error;
    res.json(competitors);
  } catch (error) {
    console.error('Error fetching competitors:', error);
    res.status(500).json({ error: 'Failed to fetch competitors' });
  }
});

// Search for new competitors
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, location, platform, businessId } = req.body;

    if (!query || !location || !platform || !businessId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const collector = dataCollectors[platform as keyof typeof dataCollectors];
    if (!collector) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const competitors = await collector.searchCompetitors(query, location);
    res.json(competitors);
  } catch (error) {
    console.error('Error searching competitors:', error);
    res.status(500).json({ error: 'Failed to search competitors' });
  }
});

// Add a new competitor
router.post('/', async (req: Request, res: Response) => {
  try {
    const { businessId, name, platform, externalId } = req.body;

    if (!businessId || !name || !platform || !externalId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Add competitor to database
    const { data: competitor, error } = await supabase
      .from('competitors')
      .insert([
        {
          business_id: businessId,
          name,
          platform,
          external_id: externalId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Fetch initial reviews
    const collector = dataCollectors[platform as keyof typeof dataCollectors];
    if (collector) {
      const reviews = await collector.getReviews(externalId);
      await etlPipeline.addToQueue(reviews, competitor.id);
    }

    res.status(201).json(competitor);
  } catch (error) {
    console.error('Error adding competitor:', error);
    res.status(500).json({ error: 'Failed to add competitor' });
  }
});

// Remove a competitor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error removing competitor:', error);
    res.status(500).json({ error: 'Failed to remove competitor' });
  }
});

export default router;