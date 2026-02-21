/**
 * Reusable geocoding hook
 * Provides coordinates for any location with automatic updates
 */

import { Coordinates, geocodeLocation, GeocodingResult, LocationInput } from '@/lib/geocoding-service';
import { useEffect, useState } from 'react';

interface UseGeocodeOptions {
  /** Saved coordinates to use if available */
  savedCoordinates?: Coordinates | null;
  /** Whether to automatically geocode on mount/change */
  autoGeocode?: boolean;
}

interface UseGeocodeReturn {
  /** Current coordinates */
  coordinates: Coordinates | null;
  /** Whether geocoding is in progress */
  isGeocoding: boolean;
  /** Error message if geocoding failed */
  error: string | null;
  /** Source of the coordinates */
  source: GeocodingResult['source'] | null;
  /** Accuracy of the coordinates */
  accuracy: GeocodingResult['accuracy'] | null;
  /** Manually trigger geocoding */
  geocode: () => Promise<void>;
}

/**
 * Hook to geocode a location
 * 
 * @example
 * ```tsx
 * const { coordinates, isGeocoding } = useGeocode({
 *   region: 'Dar es Salaam',
 *   district: 'Ilala',
 * });
 * ```
 */
export function useGeocode(
  location: LocationInput,
  options: UseGeocodeOptions = {}
): UseGeocodeReturn {
  const { savedCoordinates, autoGeocode = true } = options;
  
  const [coordinates, setCoordinates] = useState<Coordinates | null>(savedCoordinates || null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<GeocodingResult['source'] | null>(null);
  const [accuracy, setAccuracy] = useState<GeocodingResult['accuracy'] | null>(null);

  const geocode = async () => {
    if (!location.region && !location.district) {
      setError('No location provided');
      return;
    }

    setIsGeocoding(true);
    setError(null);

    try {
      const result = await geocodeLocation(location, savedCoordinates);
      setCoordinates(result.coordinates);
      setSource(result.source);
      setAccuracy(result.accuracy);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Geocoding failed';
      setError(errorMessage);
      console.error('[useGeocode] Error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Auto-geocode when location changes
  useEffect(() => {
    if (autoGeocode && (location.region || location.district)) {
      geocode();
    }
  }, [location.region, location.district, location.ward, autoGeocode]);

  return {
    coordinates,
    isGeocoding,
    error,
    source,
    accuracy,
    geocode,
  };
}

/**
 * Hook to get coordinates for a property
 * Handles both saved coordinates and geocoding
 * 
 * @example
 * ```tsx
 * const { coordinates } = usePropertyGeocode(property);
 * ```
 */
export function usePropertyGeocode(property: any) {
  const savedCoords = property?.address?.coordinates || property?.coordinates;
  
  const location: LocationInput = {
    region: property?.address?.region || property?.region,
    district: property?.address?.district || property?.district,
    ward: property?.address?.ward || property?.ward,
    street: property?.address?.street || property?.street,
  };

  return useGeocode(location, {
    savedCoordinates: savedCoords,
    autoGeocode: true,
  });
}
