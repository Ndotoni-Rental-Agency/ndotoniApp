import { PropertyCard, PropertyType } from '@/lib/API';
import {
  fetchLongTermHomepageCache,
  fetchShortTermHomepageCache,
  ShortTermPropertyCard
} from '@/lib/homepage-cache';
import { useCallback, useEffect, useState } from 'react';

export type PropertyCategory = 'NEARBY' | 'LOWEST_PRICE' | 'FAVORITES' | 'MOST_VIEWED' | 'RECENTLY_VIEWED' | 'MORE';
export type RentalType = 'LONG_TERM' | 'SHORT_TERM';

interface CategoryPropertyResponse {
  properties: PropertyCard[];
  nextToken?: string;
  count: number;
  category: PropertyCategory;
}

interface CategorizedPropertiesResponse {
  nearby: CategoryPropertyResponse;
  lowestPrice: CategoryPropertyResponse;
  favorites?: CategoryPropertyResponse;
  mostViewed?: CategoryPropertyResponse;
  recentlyViewed?: CategoryPropertyResponse;
  more?: CategoryPropertyResponse;
}

interface AppInitialStateResponse {
  categorizedProperties: CategorizedPropertiesResponse;
}

// =============================================================================
// USE CATEGORIZED PROPERTIES (Optimized) - Supports both Long-Term and Short-Term
// Always loads from CloudFront cache (public, no auth) for maximum speed
// =============================================================================
export function useCategorizedProperties(rentalType: RentalType = 'LONG_TERM') {
  const [appData, setAppData] = useState<AppInitialStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Fetch initial app state from CloudFront cache (FAST - no auth headers, no GraphQL)
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (rentalType === 'LONG_TERM') {
        // Fetch long-term properties from CloudFront
        const cacheData = await fetchLongTermHomepageCache();
        
        if (!cacheData) {
          throw new Error('Failed to load long-term homepage cache from CloudFront');
        }
        
        // Transform to app data format
        const appData = {
          categorizedProperties: {
            nearby: {
              properties: cacheData.nearby.map((p: any) => ({ ...p, __typename: 'PropertyCard' as const })),
              count: cacheData.nearby.length,
              category: 'NEARBY' as const,
            },
            lowestPrice: {
              properties: cacheData.lowestPrice.map((p: any) => ({ ...p, __typename: 'PropertyCard' as const })),
              count: cacheData.lowestPrice.length,
              category: 'LOWEST_PRICE' as const,
            },
            mostViewed: {
              properties: cacheData.mostViewed.map((p: any) => ({ ...p, __typename: 'PropertyCard' as const })),
              count: cacheData.mostViewed.length,
              category: 'MOST_VIEWED' as const,
            },
            more: {
              properties: cacheData.more.map((p: any) => ({ ...p, __typename: 'PropertyCard' as const })),
              count: cacheData.more.length,
              category: 'MORE' as const,
            },
          },
        };
        
        setAppData(appData);
      } else {
        // Fetch short-term properties from CloudFront
        const cacheData = await fetchShortTermHomepageCache();
        
        if (!cacheData) {
          throw new Error('Failed to load short-term homepage cache from CloudFront');
        }
        
        console.log('[useCategorizedProperties] Short-term cache data:', {
          lowestPriceCount: cacheData.lowestPrice?.length || 0,
          highestPriceCount: cacheData.highestPrice?.length || 0,
          topRatedCount: cacheData.topRated?.length || 0,
          featuredCount: cacheData.featured?.length || 0,
          recentCount: cacheData.recent?.length || 0,
        });
        
        // Transform short-term data to app data format
        // Backend: lowestPrice, highestPrice, topRated, featured, recent
        // Frontend sections: lowestPrice, nearby, mostViewed, more
        const appData = {
          categorizedProperties: {
            lowestPrice: {
              properties: cacheData.lowestPrice.map((p: ShortTermPropertyCard) => ({ 
                ...p, 
                __typename: 'PropertyCard' as const,
                // Map short-term fields to PropertyCard format
                bedrooms: p.maxGuests,
                monthlyRent: p.nightlyRate, // Use nightlyRate as the price field
                propertyType: p.propertyType as PropertyType, // Cast to enum
              })),
              count: cacheData.lowestPrice.length,
              category: 'LOWEST_PRICE' as const,
            },
            nearby: {
              properties: cacheData.recent.map((p: ShortTermPropertyCard) => ({ 
                ...p, 
                __typename: 'PropertyCard' as const,
                bedrooms: p.maxGuests,
                monthlyRent: p.nightlyRate,
                propertyType: p.propertyType as PropertyType,
              })),
              count: cacheData.recent.length,
              category: 'NEARBY' as const,
            },
            mostViewed: {
              properties: cacheData.topRated.map((p: ShortTermPropertyCard) => ({ 
                ...p, 
                __typename: 'PropertyCard' as const,
                bedrooms: p.maxGuests,
                monthlyRent: p.nightlyRate,
                propertyType: p.propertyType as PropertyType,
              })),
              count: cacheData.topRated.length,
              category: 'MOST_VIEWED' as const,
            },
            more: {
              properties: cacheData.highestPrice.map((p: ShortTermPropertyCard) => ({ 
                ...p, 
                __typename: 'PropertyCard' as const,
                bedrooms: p.maxGuests,
                monthlyRent: p.nightlyRate,
                propertyType: p.propertyType as PropertyType,
              })),
              count: cacheData.highestPrice.length,
              category: 'MORE' as const,
            },
          },
        };
        
        console.log('[useCategorizedProperties] Transformed app data:', {
          lowestPrice: appData.categorizedProperties.lowestPrice.count,
          nearby: appData.categorizedProperties.nearby.count,
          mostViewed: appData.categorizedProperties.mostViewed.count,
          more: appData.categorizedProperties.more.count,
        });
        
        setAppData(appData);
      }
      
      setHasInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load homepage cache');
      console.error('Error fetching homepage cache:', err);
    } finally {
      setIsLoading(false);
    }
  }, [rentalType]);

  // Fetch on hook mount and when rentalType changes
  useEffect(() => { 
    fetchInitialData(); 
  }, [fetchInitialData]);

  return { 
    appData, 
    isLoading, 
    error, 
    refetch: fetchInitialData, 
    hasInitialized,
  };
}
