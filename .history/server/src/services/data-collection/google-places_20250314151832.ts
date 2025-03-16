import { GooglePlacesService as BaseGooglePlacesService } from '../../../services/data-collection/base/google-places';

export class GooglePlacesService extends BaseGooglePlacesService {}

// Export singleton instance
export const googlePlacesService = new GooglePlacesService();