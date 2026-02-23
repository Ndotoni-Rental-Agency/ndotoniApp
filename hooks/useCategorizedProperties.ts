import { PropertyCard, PropertyType } from '@/lib/API';
import { cachedGraphQL } from '@/lib/cache';
import { getPropertiesByCategory } from '@/lib/graphql/queries';
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

interface Region {
  id: string;
  name: string;
}

interface AppInitialStateResponse {
  categorizedProperties: CategorizedPropertiesResponse;
}

// =============================================================================
// USE CATEGORIZED PROPERTIES (Optimized) - Supports both Long-Term and Short-Term
// =============================================================================
export function useCategorizedProperties(isAuthenticated?: boolean, rentalType: RentalType = 'LONG_TERM') {
  const [appData, setAppData] = useState<AppInitialStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryTokens, setCategoryTokens] = useState<Record<string, string | null>>({
    nearby: null,
    lowestPrice: null,
    mostViewed: null,
    favorites: null,
    recentlyViewed: null,
    more: null,
  });
  const [hasInitialized, setHasInitialized] = useState(false);
  const [loadedCategories, setLoadedCategories] = useState<Set<PropertyCategory>>(new Set<PropertyCategory>(['NEARBY', 'LOWEST_PRICE']));
  const [loadingCategories, setLoadingCategories] = useState<Set<PropertyCategory>>(new Set<PropertyCategory>());

  // Fetch initial app state from CloudFront cache (no fallback)
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (rentalType === 'LONG_TERM') {
        // Fetch long-term properties
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
        // Fetch short-term properties
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
      
      const loaded = new Set<PropertyCategory>(['NEARBY', 'LOWEST_PRICE', 'MOST_VIEWED', 'MORE']);
      setLoadedCategories(loaded);
      setCategoryTokens({
        nearby: null,
        lowestPrice: null,
        mostViewed: null,
        more: null,
        favorites: null,
        recentlyViewed: null,
      });
      
      setHasInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load homepage cache');
      console.error('Error fetching homepage cache:', err);
    } finally {
      setIsLoading(false);
    }
  }, [rentalType]);

  const loadMoreForCategory = useCallback(async (category: PropertyCategory) => {
    // Map category enum to camelCase key
    let key: string;
    switch (category) {
      case 'MOST_VIEWED':
        key = 'mostViewed';
        break;
      case 'LOWEST_PRICE':
        key = 'lowestPrice';
        break;
      case 'RECENTLY_VIEWED':
        key = 'recentlyViewed';
        break;
      case 'NEARBY':
        key = 'nearby';
        break;
      case 'MORE':
        key = 'more';
        break;
      case 'FAVORITES':
        key = 'favorites';
        break;
    }
    
    const nextToken = categoryTokens[key];
    
    if (loadingCategories.has(category)) {
      return;
    }
    
    if (!nextToken || !appData) {
      return;
    }

    try {
      setLoadingCategories(prev => new Set(prev).add(category));
      
      const variables = { category, limit: 10, nextToken };
      
      const response = isAuthenticated 
        ? await cachedGraphQL.queryAuthenticated({ query: getPropertiesByCategory, variables })
        : await cachedGraphQL.queryPublic({ query: getPropertiesByCategory, variables });
      const result = response.data?.getPropertiesByCategory;

      if (result) {
        setAppData(prev => {
          if (!prev) return prev;
          const updated = { ...prev };
          const catKey = key as keyof CategorizedPropertiesResponse;

          if (updated.categorizedProperties[catKey]) {
            const existingIds = new Set(updated.categorizedProperties[catKey]!.properties.map((p: PropertyCard) => p.propertyId));
            const newProperties = result.properties.filter((p: PropertyCard) => !existingIds.has(p.propertyId));
            
            updated.categorizedProperties[catKey] = {
              ...updated.categorizedProperties[catKey]!,
              properties: [
                ...updated.categorizedProperties[catKey]!.properties,
                ...newProperties,
              ],
              nextToken: result.nextToken,
            };
          }
          return updated;
        });

        setCategoryTokens(prev => ({ ...prev, [key]: result.nextToken || null }));
      }
    } catch (err) {
      console.error(`Error loading more for category ${category}:`, err);
    } finally {
      // Remove from loading set
      setLoadingCategories(prev => {
        const next = new Set(prev);
        next.delete(category);
        return next;
      });
    }
  }, [categoryTokens, appData, isAuthenticated, loadingCategories]);

  const loadCategory = useCallback(async (category: PropertyCategory) => {
    if (loadedCategories.has(category)) return;

    try {
      const variables = { category, limit: 10 };
      
      const response = isAuthenticated
        ? await cachedGraphQL.queryAuthenticated({ query: getPropertiesByCategory, variables })
        : await cachedGraphQL.queryPublic({ query: getPropertiesByCategory, variables });
      const result = response.data?.getPropertiesByCategory;

      if (result) {
        setAppData(prev => {
          if (!prev) return prev;
          const updated = { ...prev };
          
          // Map category enum to camelCase key
          let key: keyof CategorizedPropertiesResponse;
          switch (category) {
            case 'MOST_VIEWED':
              key = 'mostViewed';
              break;
            case 'LOWEST_PRICE':
              key = 'lowestPrice';
              break;
            case 'RECENTLY_VIEWED':
              key = 'recentlyViewed';
              break;
            case 'NEARBY':
              key = 'nearby';
              break;
            case 'MORE':
              key = 'more';
              break;
            case 'FAVORITES':
              key = 'favorites';
              break;
          }

          updated.categorizedProperties[key] = result;
          return updated;
        });

        // Also use proper camelCase for tokens
        let tokenKey: string;
        switch (category) {
          case 'MOST_VIEWED':
            tokenKey = 'mostViewed';
            break;
          case 'LOWEST_PRICE':
            tokenKey = 'lowestPrice';
            break;
          case 'RECENTLY_VIEWED':
            tokenKey = 'recentlyViewed';
            break;
          case 'NEARBY':
            tokenKey = 'nearby';
            break;
          case 'MORE':
            tokenKey = 'more';
            break;
          case 'FAVORITES':
            tokenKey = 'favorites';
            break;
        }
        
        setCategoryTokens(prev => ({ ...prev, [tokenKey]: result.nextToken || null }));
        setLoadedCategories(prev => new Set(prev).add(category));
      }
    } catch (err) {
      console.error(`Error loading category ${category}:`, err);
      setLoadedCategories(prev => new Set(prev).add(category));
    }
  }, [loadedCategories, isAuthenticated]);

  const hasMoreForCategory = useCallback((category: PropertyCategory) => {
    // Map category enum to camelCase key
    let key: string;
    switch (category) {
      case 'MOST_VIEWED':
        key = 'mostViewed';
        break;
      case 'LOWEST_PRICE':
        key = 'lowestPrice';
        break;
      case 'RECENTLY_VIEWED':
        key = 'recentlyViewed';
        break;
      case 'NEARBY':
        key = 'nearby';
        break;
      case 'MORE':
        key = 'more';
        break;
      case 'FAVORITES':
        key = 'favorites';
        break;
    }
    return !!categoryTokens[key];
  }, [categoryTokens]);

  // Fetch on hook mount and when rentalType changes
  useEffect(() => { 
    fetchInitialData(); 
  }, [fetchInitialData]);

  // Refetch when authentication status changes (for favorites, etc.)
  useEffect(() => {
    if (hasInitialized && isAuthenticated !== undefined) {
      fetchInitialData();
    }
  }, [isAuthenticated]);

  return { appData, isLoading, error, refetch: fetchInitialData, loadMoreForCategory, loadCategory, hasMoreForCategory, hasInitialized, isCategoryLoaded: (cat: PropertyCategory) => loadedCategories.has(cat) };
}

// =============================================================================
// USE SINGLE CATEGORY PROPERTIES (Optimized)
// =============================================================================
export function useCategoryProperties(category: PropertyCategory, isAuthenticated?: boolean) {
  const [properties, setProperties] = useState<PropertyCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchCategoryProperties = useCallback(async (limit = 20, loadMore = false) => {
    if (!loadMore && hasInitialized) return;

    setIsLoading(true);
    setError(null);

    try {
      const variables: any = { category, limit };
      if (loadMore && nextToken) variables.nextToken = nextToken;

      const response = isAuthenticated
        ? await cachedGraphQL.queryAuthenticated({ query: getPropertiesByCategory, variables })
        : await cachedGraphQL.queryPublic({ query: getPropertiesByCategory, variables });
      const result = response.data?.getPropertiesByCategory;
      const items: PropertyCard[] = (result?.properties || []).map((p: PropertyCard) => ({ ...p, ward: p.district }));

      if (loadMore) setProperties(prev => [...prev, ...items]);
      else setProperties(items);

      setNextToken(result?.nextToken || null);
      setHasMore(!!result?.nextToken);
      setHasInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to load ${category.toLowerCase()} properties`;
      setError(errorMessage);
      console.error(`Error fetching ${category} properties:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [category, nextToken, isAuthenticated, hasInitialized]);

  const loadMore = useCallback(() => { if (!isLoading && hasMore) fetchCategoryProperties(20, true); }, [fetchCategoryProperties, isLoading, hasMore]);

  useEffect(() => { fetchCategoryProperties(); }, [category, isAuthenticated]);

  return { properties, isLoading, error, loadMore, hasMore, refetch: () => fetchCategoryProperties(), hasInitialized };
}
