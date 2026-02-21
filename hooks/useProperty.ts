// =============================================================================
// PROPERTY HOOKS FOR REACT NATIVE
// Collection of hooks for property-related functionality
// =============================================================================

import { useAuth } from '@/contexts/AuthContext';
import { CreatePropertyDraftInput, PropertyCard } from '@/lib/API';
import { GraphQLClient } from '@/lib/graphql-client';
import { createPropertyDraft, deleteProperty, toggleFavorite as toggleFavoriteMutation } from '@/lib/graphql/mutations';
import { getMe, getPropertiesByLocation } from '@/lib/graphql/queries';
import { useCallback, useEffect, useRef, useState } from 'react';

// Define PropertyFilters interface here since it's frontend-specific
interface PropertyFilters {
  region?: string;
  district?: string;
  ward?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnished?: boolean;
  moveInDate?: string;
  duration?: number;
  q?: string;
  priceSort?: 'asc' | 'desc';
}

// =============================================================================
// FAVORITES MANAGEMENT
// =============================================================================

export function usePropertyFavorites(backendFavorites?: PropertyCard[], userId?: string) {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (backendFavorites && backendFavorites.length > 0) {
      return new Set(backendFavorites.map(p => p.propertyId));
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ndotoni_favorites');
        if (stored) return new Set(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to load favorites from localStorage:', error);
      }
    }
    return new Set();
  });

  useEffect(() => {
    if (backendFavorites && backendFavorites.length > 0) {
      const backendFavoriteIds = new Set(backendFavorites.map(p => p.propertyId));
      setFavorites(backendFavoriteIds);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ndotoni_favorites', JSON.stringify(Array.from(backendFavoriteIds)));
        } catch (error) {
          console.warn('Failed to sync favorites to localStorage:', error);
        }
      }
    }
  }, [backendFavorites]);

  const toggleFavorite = useCallback(async (propertyId: string) => {
    try {
      const response = await cachedGraphQL.queryAuthenticated({
        query: toggleFavoriteMutation,
        variables: { propertyId }, // Remove userId - it comes from auth context
      });

      const result = response.data?.toggleFavorite;
      if (result?.success) {
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (result.isFavorited) newFavorites.add(propertyId);
          else newFavorites.delete(propertyId);

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('ndotoni_favorites', JSON.stringify(Array.from(newFavorites)));
            } catch {}
          }
          return newFavorites;
        });
      } else {
        console.error('Failed to toggle favorite:', result?.message);
      }
    } catch (error) {
      if (error instanceof Error && error.message?.includes('Authentication required')) {
        console.warn('Cannot toggle favorite: user not authenticated');
        return;
      }
      console.error('Error toggling favorite:', error);
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (newFavorites.has(propertyId)) newFavorites.delete(propertyId);
        else newFavorites.add(propertyId);

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('ndotoni_favorites', JSON.stringify(Array.from(newFavorites)));
          } catch {}
        }
        return newFavorites;
      });
    }
  }, []);

  const isFavorited = useCallback((propertyId: string) => favorites.has(propertyId), [favorites]);

  return { favorites: Array.from(favorites), toggleFavorite, isFavorited };
}

// =============================================================================
// FILTERS MANAGEMENT
// =============================================================================

export function usePropertyFilters(initialFilters: PropertyFilters = {}) {
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters);

  const updateFilter = useCallback((key: keyof PropertyFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value === undefined || value === '' || value === null) delete newFilters[key];
      else newFilters[key] = value;

      if (key === 'region') {
        delete newFilters.district;
        delete newFilters.ward;
      } else if (key === 'district') {
        delete newFilters.ward;
      }
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => setFilters({}), []);

  const hasActiveFilters = Object.keys(filters).length > 0;

  return { filters, updateFilter, clearFilters, hasActiveFilters, setFilters };
}

// =============================================================================
// RECENTLY VIEWED MANAGEMENT
// =============================================================================

export function useRecentlyViewed(backendRecentlyViewed?: PropertyCard[]) {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    if (backendRecentlyViewed && backendRecentlyViewed.length > 0) {
      return backendRecentlyViewed.map(p => p.propertyId);
    }
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ndotoni_recently_viewed');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    if (backendRecentlyViewed && backendRecentlyViewed.length > 0) {
      const backendRecentIds = backendRecentlyViewed.map(p => p.propertyId);
      setRecentlyViewed(backendRecentIds);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ndotoni_recently_viewed', JSON.stringify(backendRecentIds));
        } catch {}
      }
    }
  }, [backendRecentlyViewed]);

  const addToRecentlyViewed = useCallback((propertyId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== propertyId);
      const updated = [propertyId, ...filtered].slice(0, 20);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('ndotoni_recently_viewed', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('ndotoni_recently_viewed');
      } catch {}
    }
  }, []);

  return { recentlyViewed, addToRecentlyViewed, clearRecentlyViewed };
}

// =============================================================================
// SEARCH FUNCTIONALITY
// =============================================================================

export function usePropertySearch() {
  const [searchResults, setSearchResults] = useState<PropertyCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProperties = useCallback(async (filters: PropertyFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      setSearchResults([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { searchResults, isLoading, error, searchProperties };
}

// =============================================================================
// DATA FETCHING
// =============================================================================

// =============================================================================
// LOCATION-BASED PROPERTY SEARCH (for search page)
// =============================================================================

import { cachedGraphQL } from '@/lib/cache';
import { featureFlags } from '@/lib/feature-flags';
import { getDistrictSearchFeedPage, getRegionSearchFeed } from '@/lib/property-cache';

export function usePropertiesByLocation(
  region: string, 
  district?: string, 
  sortBy?: string,
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: string;
    moveInDate?: string;
  }
) {
  const [properties, setProperties] = useState<PropertyCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [fromCloudFront, setFromCloudFront] = useState(false);

  // Create stable references
  const filtersRef = useRef(filters);
  const isLoadingRef = useRef(false);
  filtersRef.current = filters;

  const fetchProperties = useCallback(
    async (limit: number = 12, loadMore: boolean = false) => {
      if (isLoadingRef.current && loadMore) {
        console.log('⚠️ [usePropertiesByLocation] Skipping loadMore - already loading');
        return [];
      }

      console.log('🔍 [usePropertiesByLocation] fetchProperties called:', {
        region,
        district,
        sortBy,
        filters: filtersRef.current,
        limit,
        loadMore,
        currentNextToken: nextToken
      });

      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const currentFilters = filtersRef.current;
        
        // Try CloudFront first if no filters/sorting and page 1
        // Skip CloudFront if moveInDate is specified (requires backend availability check)
        const canUseCloudFront = !loadMore && 
                                 !sortBy && 
                                 !currentFilters?.minPrice && 
                                 !currentFilters?.maxPrice && 
                                 !currentFilters?.bedrooms && 
                                 !currentFilters?.bathrooms && 
                                 !currentFilters?.propertyType &&
                                 !currentFilters?.moveInDate;
        
        if (currentFilters?.moveInDate) {
          console.log('⚠️ [usePropertiesByLocation] Skipping CloudFront - moveInDate filter requires backend availability check');
        }
        
        if (canUseCloudFront) {
          console.log('🚀 [usePropertiesByLocation] Trying CloudFront first');
          
          try {
            let cachedFeed: any = null;
            
            if (district) {
              // District specified - fetch district feed
              console.log('[usePropertiesByLocation] Fetching district feed:', district);
              cachedFeed = await getDistrictSearchFeedPage(region, district, 1);
            } else {
              // No district - fetch region feed
              console.log('[usePropertiesByLocation] Fetching region feed');
              cachedFeed = await getRegionSearchFeed(region);
            }
            
            if (cachedFeed && cachedFeed.properties.length > 0) {
              console.log('✅ [usePropertiesByLocation] Loaded from CloudFront:', cachedFeed.properties.length, 'properties, total:', cachedFeed.total);
              
              // Convert PropertyCard to match expected format
              const items = cachedFeed.properties.map((card: any) => ({
                ...card,
                __typename: 'PropertyCard'
              }));
              
              setProperties(items);
              setNextToken(cachedFeed.nextToken);
              setHasMore(!!cachedFeed.nextToken);
              setFromCloudFront(true);
              setError(null);
              
              return items;
            }
            
            console.log('⚠️ [usePropertiesByLocation] CloudFront miss, falling back to GraphQL');
          } catch (cacheError) {
            console.warn('[usePropertiesByLocation] CloudFront error, falling back to GraphQL:', cacheError);
          }
        }
        
        // Check if GraphQL fallback is enabled
        if (!featureFlags.enableGraphQLFallback) {
          console.log('[usePropertiesByLocation] GraphQL fallback disabled, returning empty results');
          setProperties([]);
          setNextToken(null);
          setHasMore(false);
          setFromCloudFront(false);
          setError('Properties not available in cache');
          return [];
        }
        
        // Fallback to GraphQL (only if enabled)
        setFromCloudFront(false);
        const variables = { 
          region,
          ...(district && { district }),
          ...(sortBy && { sortBy }),
          ...(currentFilters?.minPrice !== undefined && { minPrice: currentFilters.minPrice }),
          ...(currentFilters?.maxPrice !== undefined && { maxPrice: currentFilters.maxPrice }),
          ...(currentFilters?.bedrooms !== undefined && { bedrooms: currentFilters.bedrooms }),
          ...(currentFilters?.bathrooms !== undefined && { bathrooms: currentFilters.bathrooms }),
          ...(currentFilters?.propertyType && { propertyType: currentFilters.propertyType }),
          ...(currentFilters?.moveInDate && { moveInDate: currentFilters.moveInDate }),
          limit, 
          nextToken: loadMore ? nextToken : null 
        };
        
        console.log('📤 [usePropertiesByLocation] Calling getPropertiesByLocation with variables:', variables);

        const response = await cachedGraphQL.query({
          query: getPropertiesByLocation,
          variables
        });

        console.log('📥 [usePropertiesByLocation] Response received:', {
          hasData: !!response.data,
          hasGetPropertiesByLocation: !!response.data?.getPropertiesByLocation,
          propertiesCount: response.data?.getPropertiesByLocation?.properties?.length || 0,
          hasNextToken: !!response.data?.getPropertiesByLocation?.nextToken
        });

        const result = response.data?.getPropertiesByLocation;
        const items = result?.properties || [];
        const newNextToken = result?.nextToken;

        console.log('✅ [usePropertiesByLocation] Processed results:', {
          itemsCount: items.length,
          hasMore: !!newNextToken,
          loadMore,
          willAppend: loadMore
        });

        if (!loadMore) {
          setProperties(items);
        } else {
          setProperties(prev => {
            // Deduplicate properties by propertyId to avoid duplicates from sharded queries
            const existingIds = new Set(prev.map(p => p.propertyId));
            const newItems = items.filter((item: PropertyCard) => !existingIds.has(item.propertyId));
            
            console.log('🔄 [usePropertiesByLocation] Appending items:', {
              previousCount: prev.length,
              newItemsCount: items.length,
              duplicatesFiltered: items.length - newItems.length,
              actualNewItems: newItems.length,
              totalAfterAppend: prev.length + newItems.length
            });
            
            return [...prev, ...newItems];
          });
        }

        setNextToken(newNextToken);
        setHasMore(!!newNextToken);
        setError(null);

        return items;
      } catch (err) {
        console.error('❌ [usePropertiesByLocation] Error fetching properties:', err);
        setError(err instanceof Error ? err.message : 'Failed to load properties');
        throw err;
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [region, district, sortBy] // Remove filters and nextToken from dependencies
  );

  const loadMore = useCallback(() => {
    console.log('🔄 [usePropertiesByLocation] loadMore called:', {
      isLoading: isLoadingRef.current,
      hasMore,
      nextToken,
      propertiesCount: properties.length,
      fromCloudFront
    });
    
    // Can load more from both CloudFront (using nextToken) and GraphQL
    if (!isLoadingRef.current && hasMore && nextToken) {
      console.log('✅ [usePropertiesByLocation] Proceeding with loadMore');
      fetchProperties(20, true);
    } else {
      console.log('⚠️ [usePropertiesByLocation] loadMore blocked:', {
        isLoading: isLoadingRef.current,
        hasMore,
        hasNextToken: !!nextToken
      });
    }
  }, [hasMore, nextToken, properties.length, fetchProperties, fromCloudFront]);

  // Reset state when search parameters change
  useEffect(() => {
    console.log('🎯 [usePropertiesByLocation] Search parameters changed, resetting state:', {
      region,
      district,
      sortBy,
      filters
    });
    
    // Reset pagination state immediately
    setNextToken(null);
    setHasMore(true);
    setFromCloudFront(false);
    
    // Fetch new data
    fetchProperties();
  }, [region, district, sortBy, fetchProperties]); // Remove filters from dependencies here too

  // Handle filters change separately to avoid infinite loops
  useEffect(() => {
    console.log('🎯 [usePropertiesByLocation] Filters changed, resetting state:', { filters });
    
    // Reset pagination state immediately
    setNextToken(null);
    setHasMore(true);
    setFromCloudFront(false);
    
    // Fetch new data
    fetchProperties();
  }, [JSON.stringify(filters), fetchProperties]);

  return {
    properties,
    isLoading,
    error,
    fetchProperties,
    loadMore,
    hasMore,
    fromCloudFront, // Expose CloudFront status
  };
}

// =============================================================================
// PROPERTY CREATION HOOKS
// =============================================================================

export function useCreatePropertyDraft() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setLocalUser, user } = useAuth();

  const createDraft = useCallback(async (input: CreatePropertyDraftInput): Promise<{ success: boolean; message: string; propertyId?: string; isGuestUser?: boolean; status?: string }> => {
    setIsCreating(true);
    setError(null);

    try {
      console.log('📤 [useCreatePropertyDraft] Creating property draft with input:', input);
      
      // Use appropriate GraphQL method based on authentication status
      const response = user
        ? await cachedGraphQL.queryAuthenticated({
            query: createPropertyDraft,
            variables: { input },
          })
        : await cachedGraphQL.queryPublic({
            query: createPropertyDraft,
            variables: { input },
          });

      const result = response.data?.createPropertyDraft;
      if (result?.success) {
        // Only update user state if authenticated
        if (user) {
          // update user to have hasProperties = true (optimistically, locally)
          if (setLocalUser) {
            try {
              setLocalUser({ hasProperties: true });
            } catch (e) {
              console.warn('Failed to set local user state:', e);
            }
          } else {
            try {
              await cachedGraphQL.queryAuthenticated({ query: getMe, forceRefresh: true });
            } catch (refreshErr) {
              console.warn('Failed to refresh current user after creating property draft:', refreshErr);
            }
          }
        }
        
        return {
          success: true,
          message: result.message,
          propertyId: result.propertyId,
          isGuestUser: result.isGuestUser,
          status: result.status,
        };
      } else {
        throw new Error(result?.message || 'Failed to create property draft');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the property draft';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsCreating(false);
    }
  }, [user, setLocalUser]);

  return { createDraft, isCreating, error };
}


export function useDeleteProperty() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePropertyById = useCallback(async (propertyId: string): Promise<{ success: boolean; message: string }> => {
    setIsDeleting(true);
    setError(null);

    try {
      console.log('📤 [useDeleteProperty] Deleting property with ID:', propertyId);
      const response = await GraphQLClient.executeAuthenticated(
        deleteProperty,
        { propertyId }
      );

      const result = response?.deleteProperty;
      if (result?.success) {
        return {
          success: true,
          message: result.message,
        };
      } else {
        throw new Error(result?.message || 'Failed to delete property');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the property';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deletePropertyById, isDeleting, error };
}

// =============================================================================
// CATEGORIZED PROPERTIES (for home page)
// =============================================================================

export function usePropertyCards(userId?: string, region: string = 'Dar es Salaam', district?: string, sortBy?: string) {
  const [properties, setProperties] = useState<PropertyCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<PropertyCard[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<PropertyCard[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchProperties = useCallback(
    async (limit: number = 12, loadMore: boolean = false) => {
      if (isLoading && !loadMore) return [];

      setIsLoading(true);
      setError(null);

      try {
        const response = await cachedGraphQL.query({
          query: getPropertiesByLocation,
          variables: { 
            region,
            ...(district && { district }),
            ...(sortBy && { sortBy }),
            limit, 
            nextToken: loadMore ? nextToken : null 
          },
        });

        const result = response.data?.getPropertiesByLocation;
        const items = result?.properties || [];
        const newNextToken = result?.nextToken;

        if (!loadMore) {
          setProperties(items);
          setHasInitialized(true);
        } else {
          setProperties(prev => [...prev, ...items]);
        }

        setNextToken(newNextToken);
        setHasMore(!!newNextToken);
        setError(null);

        return items;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load properties');
        setHasInitialized(true);
        console.error('Error fetching properties:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [region, district, sortBy, nextToken, isLoading]
  );

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) return fetchProperties(12, true);
  }, [fetchProperties, isLoading, hasMore]);

  useEffect(() => {
    if (!hasInitialized) fetchProperties();
  }, [fetchProperties, hasInitialized]);

  const { deletePropertyById } = useDeleteProperty();

  return {
    properties,
    isLoading,
    error,
    fetchProperties,
    loadMore,
    hasMore,
    hasInitialized,
    setProperties,
    favorites,
    recentlyViewed,
    setFavorites,
    setRecentlyViewed,
    deletePropertyById
  };
}
