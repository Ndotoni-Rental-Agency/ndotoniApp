/**
 * React Hook for Location Search (Regions and Districts)
 * Fetches location data from CloudFront, caches in AsyncStorage for 30 days, and provides search.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  fetchLocations,
  flattenLocations,
  searchLocations,
} from '@/lib/location/location-service';
import type { FlattenedLocation } from '@/lib/location/types';

export interface UseLocationSearchReturn {
  results: FlattenedLocation[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for searching locations (regions and districts)
 */
export function useLocationSearch(
  query: string,
  debounceMs = 200
): UseLocationSearchReturn {
  const [locations, setLocations] = useState<FlattenedLocation[]>([]);
  const [results, setResults] = useState<FlattenedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Load locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchLocations();
        const flattened = flattenLocations(data);
        setLocations(flattened);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load locations');
        console.error('Error loading locations:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLocations();
  }, []);

  // Search when debounced query changes
  useEffect(() => {
    if (locations.length === 0) {
      setResults([]);
      return;
    }

    if (!debouncedQuery.trim()) {
      // Input empty: return all regions (or top 20)
      const allRegions = locations.filter(loc => loc.type === 'region');
      setResults(allRegions.slice(0, 20));
      return;
    }

    // Simple search
    const searchResults = searchLocations(locations, debouncedQuery);
    setResults(searchResults.slice(0, 20));
  }, [debouncedQuery, locations]);

  return { results, isLoading, error };
}
