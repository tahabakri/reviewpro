import { Router } from 'express';
import { GooglePlacesService } from '../services/google-places';

const router = Router();
const googlePlacesService = new GooglePlacesService();

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter is required and must be a string'
      });
    }

    const places = await googlePlacesService.searchPlaces(query);
    res.json(places);
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({
      error: 'Failed to search places'
    });
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