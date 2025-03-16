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

    // Specialized error handling
    let statusCode = 500;
    let errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    if (errorMessage.includes('INVALID_REQUEST')) {
      statusCode = 400;
    } else if (errorMessage.includes('API key')) {
      statusCode = 401;
    } else if (errorMessage.includes('OVER_QUERY_LIMIT')) {
      statusCode = 429;
    } else if (errorMessage.includes('REQUEST_DENIED')) {
      statusCode = 403;
    } else if (errorMessage.includes('ZERO_RESULTS')) {
      statusCode = 404;
      errorMessage = 'No results found for this search';
    } else if (errorMessage.includes('Google Places API error')) {
      statusCode = 502;
    }

    const errorResponse = {
      error: 'Failed to search places',
      details: errorMessage,
      status: statusCode
    };

    console.error('Search error response:', errorResponse);
    return res.status(statusCode).json(errorResponse);
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
    // Specialized error handling for place details
    let statusCode = 500;
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('INVALID_REQUEST')) {
      statusCode = 400;
    } else if (errorMessage.includes('API key')) {
      statusCode = 401;
    } else if (errorMessage.includes('OVER_QUERY_LIMIT')) {
      statusCode = 429;
    } else if (errorMessage.includes('REQUEST_DENIED')) {
      statusCode = 403;
    } else if (errorMessage.includes('NOT_FOUND')) {
      statusCode = 404;
      errorMessage = 'Place not found';
    }

    const errorResponse = {
      error: 'Failed to get place details',
      details: errorMessage,
      status: statusCode
    };

    console.error('Details error response:', errorResponse);
    return res.status(statusCode).json(errorResponse);
  }
});

export default router;
