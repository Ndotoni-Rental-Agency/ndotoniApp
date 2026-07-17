/**
 * Reusable geocoding hook
 * Provides coordinates for any location with automatic updates
 */

import { Coordinates, geocodeLocation, GeocodingResult, LocationInput } from '@/lib/geocoding-service';
import { GoogleMapsParser, parseGoogleMapsLink } from '@/lib/parse-google-maps-link';
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
 * Handles saved coordinates, Google Maps link parsing, and geocoding fallback.
 * Priority: saved coordinates > Google Maps link > geocoding from address
 * 
 * @example
 * ```tsx
 * const { coordinates } = usePropertyGeocode(property);
 * ```
 */
export function usePropertyGeocode(property: any) {
  const savedCoords = property?.address?.coordinates || property?.coordinates;
  const googleMapsLink = property?.googleMapsUrl || property?.googleMapsLink;
  const [resolvedCoords, setResolvedCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Try to extract precise coordinates from Google Maps link (sync parse for full URLs)
  let effectiveCoords = savedCoords;
  if (!effectiveCoords && googleMapsLink) {
    const parsed = parseGoogleMapsLink(googleMapsLink);
    if (parsed) {
      effectiveCoords = parsed;
    }
  }

  // Use async-resolved coords if available
  if (!effectiveCoords && resolvedCoords) {
    effectiveCoords = resolvedCoords;
  }

  // If sync parse failed and it's a short link, resolve async
  useEffect(() => {
    if (!savedCoords && googleMapsLink && GoogleMapsParser.isShortLink(googleMapsLink)) {
      GoogleMapsParser.parseAsync(googleMapsLink).then((coords) => {
        if (coords) setResolvedCoords(coords);
      });
    }
  }, [googleMapsLink, savedCoords]);

  const location: LocationInput = {
    region: property?.address?.region || property?.region,
    district: property?.address?.district || property?.district,
    ward: property?.address?.ward || property?.ward,
    street: property?.address?.street || property?.street,
  };

  return useGeocode(location, {
    savedCoordinates: effectiveCoords,
    autoGeocode: true,
  });
}
