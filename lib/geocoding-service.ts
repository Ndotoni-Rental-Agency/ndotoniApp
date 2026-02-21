/**
 * Unified Geocoding Service
 * Provides consistent geocoding across the app with multiple fallback strategies
 */

import { MAPS_CONFIG } from '@/config/maps';
import { getCoordinatesFromAddress } from '@/config/tanzania-locations';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInput {
  region?: string;
  district?: string;
  ward?: string;
  street?: string;
}

export interface GeocodingResult {
  coordinates: Coordinates;
  source: 'saved' | 'local-database' | 'google-api' | 'nominatim' | 'fallback';
  accuracy: 'exact' | 'district' | 'region' | 'approximate';
}

/**
 * Main geocoding function with multiple fallback strategies
 * 
 * Priority:
 * 1. Saved coordinates (if provided)
 * 2. Google Geocoding API (accurate, requires API key)
 * 3. Nominatim/OpenStreetMap (free, rate-limited)
 * 4. Local Tanzania database (instant, reliable fallback)
 * 5. Tanzania center (always works)
 */
export async function geocodeLocation(
  location: LocationInput,
  savedCoordinates?: Coordinates | null
): Promise<GeocodingResult> {
  
  // Strategy 1: Use saved coordinates if available and valid (not 0,0)
  if (
    savedCoordinates?.latitude && 
    savedCoordinates?.longitude &&
    (savedCoordinates.latitude !== 0 || savedCoordinates.longitude !== 0)
  ) {
    console.log('[GeocodingService] Using saved coordinates');
    return {
      coordinates: savedCoordinates,
      source: 'saved',
      accuracy: 'exact',
    };
  }

  // Strategy 2: Try Google Geocoding API (if available)
  try {
    const googleCoords = await geocodeWithGoogle(location);
    if (googleCoords) {
      console.log('[GeocodingService] Using Google API coordinates');
      return {
        coordinates: googleCoords,
        source: 'google-api',
        accuracy: 'exact',
      };
    }
  } catch (error) {
    console.warn('[GeocodingService] Google API failed:', error);
  }

  // Strategy 3: Try Nominatim/OpenStreetMap (free, rate-limited)
  try {
    const nominatimCoords = await geocodeWithNominatim(location);
    if (nominatimCoords) {
      console.log('[GeocodingService] Using Nominatim coordinates', {location});
      return {
        coordinates: nominatimCoords,
        source: 'nominatim',
        accuracy: 'exact',
      };
    }
  } catch (error) {
    console.warn('[GeocodingService] Nominatim failed:', error);
  }

  // Strategy 4: Try local Tanzania database (instant, no API needed)
  const localCoords = getCoordinatesFromAddress(
    location.region,
    location.district,
    location.ward
  );
  
  if (localCoords) {
    console.log('[GeocodingService] Using local database coordinates');
    const accuracy = location.ward ? 'district' : 'region';
    return {
      coordinates: localCoords,
      source: 'local-database',
      accuracy,
    };
  }

  // Strategy 5: Fallback to Tanzania center
  console.log('[GeocodingService] Using fallback coordinates (Tanzania center)');
  return {
    coordinates: MAPS_CONFIG.TANZANIA_CENTER,
    source: 'fallback',
    accuracy: 'approximate',
  };
}

/**
 * Geocode using Google Geocoding API
 */
async function geocodeWithGoogle(location: LocationInput): Promise<Coordinates | null> {
  if (!location.region && !location.district) {
    return null;
  }

  // Try multiple search strategies, prioritizing ward if available
  const searchQueries = [
    // Most specific: ward + district + region
    location.ward && location.district && location.region
      ? `${location.ward}, ${location.district}, ${location.region}, Tanzania`
      : null,
    location.ward && location.district
      ? `${location.ward} Ward, ${location.district} District, ${location.region}, Tanzania`
      : null,
    location.ward && location.district
      ? `${location.ward}, ${location.district}, Tanzania`
      : null,
    // District level
    location.district && location.region
      ? `${location.district}, ${location.region}, Tanzania`
      : null,
    location.district
      ? `${location.district} District, ${location.region}, Tanzania`
      : null,
    location.district
      ? `${location.district}, Tanzania`
      : null,
    // Region only as last resort
    location.region
      ? `${location.region}, Tanzania`
      : null,
  ].filter((q): q is string => q !== null);

  // Try each query until we get a result
  for (const address of searchQueries) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MAPS_CONFIG.GOOGLE_API_KEY}`
      );
      
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        console.log(`[GeocodingService] Google API success with query: "${address}"`);
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }
      
      // If status is not OK, log and try next query
      if (data.status !== 'ZERO_RESULTS') {
        console.warn(`[GeocodingService] Google API status: ${data.status} for query: "${address}"`);
      }
    } catch (error) {
      console.error(`[GeocodingService] Google API error for query "${address}":`, error);
    }
  }
  
  return null;
}

/**
 * Geocode using Nominatim/OpenStreetMap
 */
async function geocodeWithNominatim(location: LocationInput): Promise<Coordinates | null> {
  if (!location.region && !location.district) {
    return null;
  }

  // Normalize location names to title case
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const normalizedRegion = location.region ? normalizeText(location.region) : '';
  const normalizedDistrict = location.district ? normalizeText(location.district) : '';
  const normalizedWard = location.ward ? normalizeText(location.ward) : '';

  // Try multiple search strategies, prioritizing ward if available
  const searchQueries = [
    // Most specific: ward + district + region
    normalizedWard && normalizedDistrict && normalizedRegion 
      ? `${normalizedWard}, ${normalizedDistrict}, ${normalizedRegion}, Tanzania`
      : null,
    normalizedWard && normalizedDistrict
      ? `${normalizedWard} Ward, ${normalizedDistrict} District, ${normalizedRegion}, Tanzania`
      : null,
    normalizedWard && normalizedDistrict
      ? `${normalizedWard}, ${normalizedDistrict}, Tanzania`
      : null,
    // District level
    normalizedDistrict && normalizedRegion
      ? `${normalizedDistrict}, ${normalizedRegion}, Tanzania`
      : null,
    normalizedDistrict
      ? `${normalizedDistrict} District, ${normalizedRegion}, Tanzania`
      : null,
    normalizedDistrict
      ? `${normalizedDistrict}, Tanzania`
      : null,
  ].filter((q): q is string => q !== null && q.trim() !== ', Tanzania' && q.trim() !== 'Tanzania');

  for (const query of searchQueries) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(query)}&` +
        `countrycodes=tz&` +
        `limit=1`,
        {
          headers: {
            'User-Agent': 'PropertyApp/1.0',
          },
        }
      );

      if (!response.ok) continue;

      const data = await response.json();

      if (data?.[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        // Validate coordinates are within Tanzania bounds
        // Tanzania: lat -1 to -12, lng 29 to 41
        if (!isNaN(lat) && !isNaN(lng) && 
            lat >= -12 && lat <= -1 && 
            lng >= 29 && lng <= 41) {
          return {
            latitude: lat,
            longitude: lng,
          };
        }
      }

      // Respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('[GeocodingService] Nominatim error:', error);
    }
  }

  return null;
}

/**
 * Simple geocoding function for quick lookups
 * Uses only local database and fallback (no API calls)
 */
export function geocodeLocationSync(location: LocationInput): Coordinates {
  const localCoords = getCoordinatesFromAddress(
    location.region,
    location.district,
    location.ward
  );
  
  return localCoords || MAPS_CONFIG.TANZANIA_CENTER;
}

/**
 * Validate if coordinates are within Tanzania
 */
export function isValidTanzaniaCoordinates(coords: Coordinates): boolean {
  return (
    coords.latitude >= -12 &&
    coords.latitude <= -1 &&
    coords.longitude >= 29 &&
    coords.longitude <= 41
  );
}
