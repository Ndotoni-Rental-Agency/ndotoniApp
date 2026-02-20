import { useState, useCallback, useMemo } from 'react';
import { PropertyCard } from '@/lib/API';
import { PAGINATION } from '@/constants/pagination';

/**
 * Property section management for React Native
 * Handles pagination and "load more" functionality
 */
interface PropertySection {
  properties: PropertyCard[];
  displayedCount: number;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
}

export function usePropertySection(
  allProperties: PropertyCard[],
  initialCount: number = 8,
  loadIncrement: number = 4
): PropertySection {
  const [displayedCount, setDisplayedCount] = useState(initialCount);

  const properties = useMemo(() => {
    return allProperties.slice(0, displayedCount);
  }, [allProperties, displayedCount]);

  const hasMore = useMemo(() => {
    return displayedCount < allProperties.length;
  }, [displayedCount, allProperties.length]);

  const loadMore = useCallback(() => {
    if (hasMore) {
      setDisplayedCount(prev => Math.min(prev + loadIncrement, allProperties.length));
    }
  }, [hasMore, loadIncrement, allProperties.length]);

  const reset = useCallback(() => {
    setDisplayedCount(initialCount);
  }, [initialCount]);

  return {
    properties,
    displayedCount,
    hasMore,
    loadMore,
    reset
  };
}

// Specific hooks for each section
export function useNearbyProperties(allProperties: PropertyCard[]) {
  return usePropertySection(allProperties, PAGINATION.NEARBY_INITIAL, PAGINATION.NEARBY_INCREMENT);
}

export function useRecentlyViewedProperties(allProperties: PropertyCard[]) {
  return usePropertySection(allProperties, PAGINATION.RECENT_INITIAL, PAGINATION.RECENT_INCREMENT);
}

export function useFavoriteProperties(allProperties: PropertyCard[]) {
  return usePropertySection(allProperties, PAGINATION.FAVORITES_INITIAL, PAGINATION.FAVORITES_INCREMENT);
}
