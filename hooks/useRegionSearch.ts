/**
 * React Hook for Location Search (Regions and Districts)
 * Fetches location data from CloudFront JSON, caches in localStorage for 30 days, and provides fuzzy search.
 */

import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import {
  fetchLocations,
  flattenLocations,
  type FlattenedLocation,
} from '@/lib/location/cloudfront-locations';

// Fuse.js configuration for location search
const FUSE_OPTIONS = {
  keys: ['name', 'displayName'],
  threshold: 0.3, // Lower = more strict matching
  distance: 100,
  minMatchCharLength: 1,
  includeScore: true,
  ignoreLocation: true,
};

export interface UseRegionSearchReturn {
  results: FlattenedLocation[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for searching locations (regions and districts) with fuzzy matching
 */
export function useRegionSearch(
  query: string,
  debounceMs = 200
): UseRegionSearchReturn {
  const [locations, setLocations] = useState<FlattenedLocation[]>([]);
  const [results, setResults] = useState<FlattenedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Create Fuse instance when locations are loaded
  const fuse = useMemo(() => {
    if (locations.length === 0) return null;
    return new Fuse(locations, FUSE_OPTIONS);
  }, [locations]);

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
    if (!fuse) {
      setResults([]);
      return;
    }

    if (!debouncedQuery.trim()) {
      // Input empty: return all regions (or top 20)
      const allRegions = locations.filter(loc => loc.type === 'region');
      setResults(allRegions.slice(0, 20));
      return;
    }

    // Fuzzy search
    const fuseResults = fuse.search(debouncedQuery, { limit: 20 });
    setResults(fuseResults.map(result => result.item));
  }, [debouncedQuery, fuse, locations]);

  return { results, isLoading, error };
}
