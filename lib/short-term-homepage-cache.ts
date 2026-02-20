/**
 * Short-Term Property Homepage Cache for React Native
 * 
 * Fetches pre-generated property cards from CloudFront for fast homepage loading.
 * Falls back to GraphQL if cache is unavailable.
 */

// Use environment variables or fallback to dev
const CLOUDFRONT_DOMAIN = process.env.EXPO_PUBLIC_CLOUDFRONT_DOMAIN || 'https://d2bstvyam1bm1f.cloudfront.net';
const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';

// Backend structure from Lambda (supports both old and new formats)
interface BackendPropertyCard {
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
  thumbnail: string;
  maxGuests: number;
}

// Frontend structure expected by components
export interface ShortTermPropertyCard {
  propertyId: string;
  title: string;
  propertyType: string;
  region: string;
  district: string;
  nightlyRate: number;
  currency: string;
  thumbnail: string;
  maxGuests: number;
  averageRating: number;
  totalReviews: number;
  instantBookEnabled: boolean;
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
 * Map backend property card structure to frontend structure
 * Handles both old format (nested location, pricePerNight) and new format (flat region/district, nightlyRate)
 */
function mapBackendToFrontend(backendCard: BackendPropertyCard): ShortTermPropertyCard {
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

/**
 * Fetch short-term properties homepage cache from CloudFront
 * 
 * @returns Homepage cache data with all property categories
 */
export async function fetchShortTermHomepageCache(): Promise<ShortTermHomepageCache> {
  try {
    const url = `${CLOUDFRONT_DOMAIN}/homepage/${STAGE}/short-term-properties.json`;
    
    console.log('[ShortTermHomepageCache] Fetching from:', url);
    console.log('[ShortTermHomepageCache] Environment:', { CLOUDFRONT_DOMAIN, STAGE });
    
    const response = await fetch(url);

    if (!response.ok) {
      console.error('[ShortTermHomepageCache] Failed to fetch cache:', {
        status: response.status,
        statusText: response.statusText,
        url,
      });
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('[ShortTermHomepageCache] Cache hit', {
      generatedAt: data.generatedAt,
      lowestPriceCount: data.lowestPrice?.length || 0,
      highestPriceCount: data.highestPrice?.length || 0,
      topRatedCount: data.topRated?.length || 0,
      featuredCount: data.featured?.length || 0,
      recentCount: data.recent?.length || 0,
    });

    // Map backend structure to frontend structure
    return {
      lowestPrice: (data.lowestPrice || []).map(mapBackendToFrontend),
      highestPrice: (data.highestPrice || []).map(mapBackendToFrontend),
      topRated: (data.topRated || []).map(mapBackendToFrontend),
      featured: (data.featured || []).map(mapBackendToFrontend),
      recent: (data.recent || []).map(mapBackendToFrontend),
      generatedAt: data.generatedAt,
    };
  } catch (error) {
    console.error('[ShortTermHomepageCache] Error fetching cache:', error);
    console.log('[ShortTermHomepageCache] Falling back to empty state');
    
    // Return empty cache instead of throwing
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
