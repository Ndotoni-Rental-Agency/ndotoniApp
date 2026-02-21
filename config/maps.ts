/**
 * Maps Configuration
 * Contains API keys and settings for map services
 */

export const MAPS_CONFIG = {
  // Google Maps API Key
  // Used for: Geocoding, Maps Display, Places API
  GOOGLE_API_KEY: 'AIzaSyAA79IOdXt_LrssAhIYer_ZQQHNeD8Xogs',
  
  // URL Signing Secret (optional, for enhanced security)
  URL_SIGNING_SECRET: 'c4Wnwr0M6DfAQHazFGrzBjaZXKY=',
  
  // Default map settings
  DEFAULT_REGION: {
    latitude: -6.369028,
    longitude: 34.888822,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
  
  // Tanzania center coordinates (fallback)
  TANZANIA_CENTER: {
    latitude: -6.369028,
    longitude: 34.888822,
  },
};
