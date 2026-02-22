/**
 * Homepage Cache for Mobile App
 * 
 * Fetches pre-generated property cards from CloudFront for fast homepage loading.
 * Supports both long-term and short-term properties.
 */

import { PropertyCard } from '@/lib/API';

const CLOUDFRONT_DOMAIN = process.env.EXPO_PUBLIC_CLOUDFRONT_DOMAIN || 'https://d2bstvyam1bm1f.cloudfront.net';
const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';

// Single URL for homepage cache (long-term properties)
const HOMEPAGE_CACHE_URL = process.env.EXPO_PUBLIC_HOMEPAGE_CACHE_URL || 
  `${CLOUDFRONT_DOMAIN}/homepage/${STAGE}/properties.json`;

export interface ShortTermPropertyCard {
  propertyId: string;
  title: string;
  propertyType: string;
  region: string;
  district: string;
  nightlyRate: number;
  currency: string;
  thumbnail?: string;
  maxGuests: number;
  averageRating?: number;
  totalReviews?: number;
  instantBookEnabled?: boolean;
}

// Backend structure from Lambda (supports both old and new formats)
interface BackendShortTermPropertyCard {
  propertyId: string;
  title: string;
  propertyType: string;
  // New format (flat)
  region?: string;
  district?: string;
  nightlyRate?: number;
  averageRating?: number;
  totalReviews?: number;
  instantBookEnabled?: boolean;
  // Old format (nested)
  location?: {
    city: string;
    region: string;
    district: string;
  };
  pricePerNight?: number;
  bedrooms?: number;
  bathrooms?: number;
  instantBook?: boolean;
  // Common fields
  currency: string;
  thumbnail?: string;
  maxGuests: number;
}

/**
 * Map backend property card structure to frontend structure
 * Handles both old format (nested location, pricePerNight) and new format (flat region/district, nightlyRate)
 */
function mapBackendShortTermToFrontend(backendCard: BackendShortTermPropertyCard): ShortTermPropertyCard {
  // Handle both old and new formats
  const region = backendCard.region || backendCard.location?.region || '';
  const district = backendCard.district || backendCard.location?.district || '';
  const nightlyRate = backendCard.nightlyRate ?? backendCard.pricePerNight ?? 0;
  const instantBookEnabled = backendCard.instantBookEnabled ?? backendCard.instantBook ?? false;
  
  return {
    propertyId: backendCard.propertyId,
    title: backendCard.title,
    propertyType: backendCard.propertyType,
    region,
    district,
    nightlyRate,
    currency: backendCard.currency,
    thumbnail: backendCard.thumbnail,
    maxGuests: backendCard.maxGuests,
    averageRating: backendCard.averageRating || 0,
    totalReviews: backendCard.totalReviews || 0,
    instantBookEnabled,
  };
}

export interface LongTermHomepageCache {
  lowestPrice: any[];
  nearby: any[];
  mostViewed: any[];
  recentlyViewed: any[];
  favorites: any[];
  more: any[];
  generatedAt: string;
}

export interface HomepageCacheData {
  lowestPrice: any[];
  highestPrice: any[];
  featured: any[];
  recent: any[];
  generatedAt: string;
  stage: string;
}

export interface ShortTermHomepageCache {
  lowestPrice: ShortTermPropertyCard[];
  highestPrice: ShortTermPropertyCard[];
  topRated: ShortTermPropertyCard[];
  featured: ShortTermPropertyCard[];
  recent: ShortTermPropertyCard[];
  generatedAt: string;
}

/**
 * Fetch all homepage property sections from CloudFront cache
 * Single HTTP request for all data - extremely fast!
 * Throws error if fetch fails (no fallback)
 */
export async function getHomepagePropertiesFromCache(): Promise<HomepageCacheData> {
  try {
    console.log('[HomepageCache] Fetching from:', HOMEPAGE_CACHE_URL);
    
    const response = await fetch(HOMEPAGE_CACHE_URL, {
      cache: 'no-store', // Don't cache in browser
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'max-age=60', // Request 1 minute cache from CloudFront
      },
    });
    
    if (!response.ok) {
      throw new Error(`CloudFront fetch failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('[HomepageCache] Cache hit', {
      generatedAt: data.generatedAt,
      lowestPriceCount: data.lowestPrice?.length || 0,
      recentCount: data.recent?.length || 0,
    });
    
    return data;
  } catch (error) {
    console.error('[HomepageCache] Error fetching cache:', error);
    throw error;
  }
}

/**
 * Transform CloudFront cache data to match the app's expected structure
 * Adds __typename to each property for GraphQL compatibility
 */
export function transformCacheToAppData(cacheData: HomepageCacheData) {
  // Helper to add __typename to properties
  const addTypename = (properties: any[]): PropertyCard[] => 
    properties.map(p => ({ ...p, __typename: 'PropertyCard' as const }));

  return {
    categorizedProperties: {
      nearby: {
        properties: addTypename(cacheData.recent),
        count: cacheData.recent.length,
        category: 'NEARBY' as const,
      },
      lowestPrice: {
        properties: addTypename(cacheData.lowestPrice),
        count: cacheData.lowestPrice.length,
        category: 'LOWEST_PRICE' as const,
      },
      mostViewed: {
        properties: addTypename(cacheData.featured),
        count: cacheData.featured.length,
        category: 'MOST_VIEWED' as const,
      },
      more: {
        properties: addTypename(cacheData.highestPrice),
        count: cacheData.highestPrice.length,
        category: 'MORE' as const,
      },
    },
  };
}

/**
 * Fetch long-term properties homepage cache from CloudFront
 */
export async function fetchLongTermHomepageCache(): Promise<LongTermHomepageCache> {
  try {
    const url = `${CLOUDFRONT_DOMAIN}/homepage/${STAGE}/long-term-properties.json`;
    
    console.log('[HomepageCache] Fetching long-term from:', url);
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'max-age=60',
      },
    });

    if (!response.ok) {
      console.error('[HomepageCache] Failed to fetch long-term cache:', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('[HomepageCache] Long-term cache hit', {
      generatedAt: data.generatedAt,
      lowestPriceCount: data.lowestPrice?.length || 0,
      nearbyCount: data.nearby?.length || 0,
    });

    // Ensure all expected properties exist
    return {
      lowestPrice: data.lowestPrice || [],
      nearby: data.nearby || [],
      mostViewed: data.mostViewed || [],
      recentlyViewed: data.recentlyViewed || [],
      favorites: data.favorites || [],
      more: data.more || [],
      generatedAt: data.generatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error('[HomepageCache] Error fetching long-term cache:', error);
    
    // Return empty cache
    return {
      lowestPrice: [],
      nearby: [],
      mostViewed: [],
      recentlyViewed: [],
      favorites: [],
      more: [],
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Fetch short-term properties homepage cache from CloudFront
 */
export async function fetchShortTermHomepageCache(): Promise<ShortTermHomepageCache> {
  try {
    const url = `${CLOUDFRONT_DOMAIN}/homepage/${STAGE}/short-term-properties.json`;
    
    console.log('[HomepageCache] Fetching short-term from:', url);
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'max-age=60',
      },
    });

    if (!response.ok) {
      console.error('[HomepageCache] Failed to fetch short-term cache:', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('[HomepageCache] Short-term cache hit', {
      generatedAt: data.generatedAt,
      lowestPriceCount: data.lowestPrice?.length || 0,
      topRatedCount: data.topRated?.length || 0,
    });

    // Map backend structure to frontend structure
    return {
      lowestPrice: (data.lowestPrice || []).map(mapBackendShortTermToFrontend),
      highestPrice: (data.highestPrice || []).map(mapBackendShortTermToFrontend),
      topRated: (data.topRated || []).map(mapBackendShortTermToFrontend),
      featured: (data.featured || []).map(mapBackendShortTermToFrontend),
      recent: (data.recent || []).map(mapBackendShortTermToFrontend),
      generatedAt: data.generatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error('[HomepageCache] Error fetching short-term cache:', error);
    
    // Return empty cache
    return {
      lowestPrice: [],
      highestPrice: [],
      topRated: [],
      featured: [],
      recent: [],
      generatedAt: new Date().toISOString(),
    };
  }
}
