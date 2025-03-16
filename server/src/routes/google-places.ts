import { Router } from 'express';
import { GooglePlacesService } from '../services/google-places';

const router = Router();
const googlePlacesService = new GooglePlacesService();

// Validate environment setup
if (!process.env.GOOGLE_PLACES_API_KEY) {
  console.error('CRITICAL: GOOGLE_PLACES_API_KEY environment variable is not set');
}

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      console.warn('Invalid search request:', { query });
      return res.status(400).json({
        error: 'Query parameter is required and must be a string',
        details: 'Please provide a valid search term'
      });
    }

    if (query.trim().length < 2) {
      console.warn('Search query too short:', { query });
      return res.status(400).json({
        error: 'Query parameter too short',
        details: 'Search term must be at least 2 characters long'
      });
    }

    console.info('Processing search request:', { query });
    const places = await googlePlacesService.searchPlaces(query);
    
    if (places.length === 0) {
      console.info('No results found for query:', { query });
      return res.status(404).json({
        error: 'No results found',
        details: 'Try adjusting your search terms'
      });
    }

    console.info(`Returning ${places.length} results`);
    res.json(places);
    res.status(200).send('Success');
  } catch (error) {
    console.error('Error searching places:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      query: req.query.query
    });

    const statusCode = error instanceof Error && error.message.includes('API error') ? 502 : 500;
    const errorMessage = error instanceof Error ? error.message : 'Failed to search places';

    res.status(statusCode).json({
      error: 'Failed to search places',
      details: errorMessage
    });
    res.status(500).send('Internal Server Error');
  }
});

router.get('/details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const details = await googlePlacesService.getPlaceDetails(placeId);
    res.json(details);
  } catch (error) {
    console.error('Error getting place details:', error);
    res.status(500).json({
      error: 'Failed to get place details'
    });
  }
});

export default router;