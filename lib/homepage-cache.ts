/**
 * Homepage Cache for Mobile App
 * 
 * Fetches pre-generated property cards from CloudFront for fast homepage loading.
 * Supports both long-term and short-term properties.
 */

const CLOUDFRONT_DOMAIN = process.env.EXPO_PUBLIC_CLOUDFRONT_DOMAIN || 'https://d2bstvyam1bm1f.cloudfront.net';
const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';

// Property card interfaces
export interface PropertyCard {
  propertyId: string;
  title: string;
  propertyType: string;
  region: string;
  district: string;
  currency: string;
  thumbnail?: string;
  bedrooms?: number;
  monthlyRent?: number;
}

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

export interface LongTermHomepageCache {
  lowestPrice: PropertyCard[];
  nearby: PropertyCard[];
  mostViewed: PropertyCard[];
  recentlyViewed: PropertyCard[];
  favorites: PropertyCard[];
  more: PropertyCard[];
  generatedAt: string;
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
 * Fetch long-term properties homepage cache from CloudFront
 */
export async function fetchLongTermHomepageCache(): Promise<LongTermHomepageCache> {
  try {
    const url = `${CLOUDFRONT_DOMAIN}/homepage/${STAGE}/long-term-properties.json`;
    
    console.log('[HomepageCache] Fetching long-term from:', url);
    
    const response = await fetch(url);

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
    
    const response = await fetch(url);

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

    // Ensure all expected properties exist
    return {
      lowestPrice: data.lowestPrice || [],
      highestPrice: data.highestPrice || [],
      topRated: data.topRated || [],
      featured: data.featured || [],
      recent: data.recent || [],
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
