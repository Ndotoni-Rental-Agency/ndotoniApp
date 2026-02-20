import { useState, useEffect, useCallback } from 'react';
import { fetchShortTermHomepageCache, ShortTermPropertyCard } from '@/lib/short-term-homepage-cache';

export interface ShortTermCategorizedProperties {
  lowestPrice: ShortTermPropertyCard[];
  highestPrice: ShortTermPropertyCard[];
  topRated: ShortTermPropertyCard[];
  featured: ShortTermPropertyCard[];
  recent: ShortTermPropertyCard[];
}

/**
 * Hook to fetch short-term properties from homepage cache
 * 
 * Fetches from CloudFront cache for fast loading
 * Falls back to GraphQL if cache is unavailable
 */
export function useShortTermProperties() {
  const [properties, setProperties] = useState<ShortTermCategorizedProperties | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[useShortTermProperties] Starting fetch...');
      const cache = await fetchShortTermHomepageCache();
      console.log('[useShortTermProperties] Received cache:', cache);
      console.log('[useShortTermProperties] Categories:', {
        lowestPrice: cache.lowestPrice?.length || 0,
        highestPrice: cache.highestPrice?.length || 0,
        topRated: cache.topRated?.length || 0,
        featured: cache.featured?.length || 0,
        recent: cache.recent?.length || 0,
      });

      setProperties({
        lowestPrice: cache.lowestPrice,
        highestPrice: cache.highestPrice,
        topRated: cache.topRated,
        featured: cache.featured,
        recent: cache.recent,
      });
      
      console.log('[useShortTermProperties] Properties set successfully');
    } catch (err) {
      console.error('[useShortTermProperties] Failed to fetch:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch properties'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const refetch = useCallback(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    isLoading,
    error,
    refetch,
  };
}
