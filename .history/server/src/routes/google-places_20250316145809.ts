import { Router } from 'express';
import { GooglePlacesService } from '../services/google-places/index.js';

const router = Router();
let googlePlacesService: GooglePlacesService;

// Validate environment setup and initialize service
try {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error('CRITICAL: GOOGLE_PLACES_API_KEY environment variable is not set');
  }
  googlePlacesService = new GooglePlacesService();
} catch (error) {
  console.error('Failed to initialize Google Places service:', error);
}

router.get('/search', async (req, res) => {
  try {
    // Check if service was properly initialized
    if (!googlePlacesService) {
      console.error('Google Places service is not initialized');
      return res.status(503).json({
        error: 'Service unavailable',
        details: 'Google Places service is not properly configured'
      });
    }

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
    return res.json(places);
  } catch (error) {
    console.error('Error searching places:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      query: req.query.query
    });

    // Better error classification
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes('API key')) {
        statusCode = 401; // Unauthorized due to API key issues
      } else if (error.message.includes('API error')) {
        statusCode = 502; // Bad Gateway for external API issues
      }
    }

    return res.status(statusCode).json({
      error: 'Failed to search places',
      details: errorMessage
    });
  }
});

router.get('/details/:placeId', async (req, res) => {
  try {
    // Check if service was properly initialized
    if (!googlePlacesService) {
      console.error('Google Places service is not initialized');
      return res.status(503).json({
        error: 'Service unavailable',
        details: 'Google Places service is not properly configured'
      });
    }
    
    const { placeId } = req.params;
    const details = await googlePlacesService.getPlaceDetails(placeId);
    return res.json(details);
  } catch (error) {
    console.error('Error getting place details:', error);
    return res.status(500).json({
      error: 'Failed to get place details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;