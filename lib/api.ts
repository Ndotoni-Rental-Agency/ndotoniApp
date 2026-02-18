/**
 * API Client for ndotoni Mobile App
 * Fetches property data from CloudFront cache and GraphQL backend
 */

// CloudFront Configuration
const CLOUDFRONT_DOMAIN = process.env.EXPO_PUBLIC_CLOUDFRONT_DOMAIN || 'https://d2bstvyam1bm1f.cloudfront.net';
const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';

// GraphQL Configuration
const GRAPHQL_ENDPOINT = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT || 
  'https://pkqm7izcm5gm5hall3gc6o5dx4.appsync-api.us-west-2.amazonaws.com/graphql';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'da2-4kqoqw7d2jbndbilqiqpkypsve';

// Type Definitions
export interface PropertyCard {
  propertyId: string;
  title: string;
  region: string;
  district: string;
  monthlyRent?: number;
  currency: string;
  bedrooms?: number;
  thumbnail?: string;
  propertyType?: string;
}

export interface ShortTermProperty {
  propertyId: string;
  title: string;
  region: string;
  district: string;
  nightlyRate: number;
  currency: string;
  maxGuests: number;
  thumbnail?: string;
  averageRating?: number;
  totalReviews?: number;
  propertyType?: string;
  instantBookEnabled?: boolean;
}

export interface CategorizedProperties {
  nearby: PropertyCard[];
  lowestPrice: PropertyCard[];
  mostViewed: PropertyCard[];
  more: PropertyCard[];
}

export interface ShortTermCategorizedProperties {
  lowestPrice: ShortTermProperty[];
  highestPrice: ShortTermProperty[];
  topRated: ShortTermProperty[];
  featured: ShortTermProperty[];
  recent: ShortTermProperty[];
}

// Backend property card structure (handles both old and new formats)
interface BackendPropertyCard {
  propertyId: string;
  title: string;
  propertyType: string;
  region?: string;
  district?: string;
  nightlyRate?: number;
  averageRating?: number;
  totalReviews?: number;
  instantBookEnabled?: boolean;
  location?: {
    city: string;
    region: string;
    district: string;
  };
  pricePerNight?: number;
  instantBook?: boolean;
  currency: string;
  thumbnail: string;
  maxGuests: number;
}

/**
 * Map backend property card to frontend structure
 */
function mapBackendToFrontend(backendCard: BackendPropertyCard): ShortTermProperty {
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
 * Fetch long-term properties from CloudFront cache
 */
async function fetchLongTermFromCache(): Promise<CategorizedProperties> {
  const url = `${CLOUDFRONT_DOMAIN}/homepage/${STAGE}/properties.json`;
  
  console.log('[API] Fetching long-term properties from:', url);
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  
  console.log('[API] Long-term cache hit:', {
    lowestPrice: data.lowestPrice?.length || 0,
    featured: data.featured?.length || 0,
    recent: data.recent?.length || 0,
  });

  return {
    nearby: data.recent || [],
    lowestPrice: data.lowestPrice || [],
    mostViewed: data.featured || [],
    more: data.highestPrice || [],
  };
}

/**
 * Fetch short-term properties from CloudFront cache
 */
async function fetchShortTermFromCache(): Promise<ShortTermCategorizedProperties> {
  const url = `${CLOUDFRONT_DOMAIN}/homepage/${STAGE}/short-term-properties.json`;
  
  console.log('[API] Fetching short-term properties from:', url);
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  
  console.log('[API] Short-term cache hit:', {
    lowestPrice: data.lowestPrice?.length || 0,
    highestPrice: data.highestPrice?.length || 0,
    topRated: data.topRated?.length || 0,
    featured: data.featured?.length || 0,
    recent: data.recent?.length || 0,
  });

  return {
    lowestPrice: (data.lowestPrice || []).map(mapBackendToFrontend),
    highestPrice: (data.highestPrice || []).map(mapBackendToFrontend),
    topRated: (data.topRated || []).map(mapBackendToFrontend),
    featured: (data.featured || []).map(mapBackendToFrontend),
    recent: (data.recent || []).map(mapBackendToFrontend),
  };
}

/**
 * Fetch long-term properties via GraphQL (fallback)
 */
async function fetchLongTermViaGraphQL(): Promise<CategorizedProperties> {
  const query = `
    query GetCategorizedProperties($limitPerCategory: Int) {
      getCategorizedProperties(limitPerCategory: $limitPerCategory) {
        lowestPrice {
          properties {
            propertyId
            title
            region
            district
            monthlyRent
            currency
            bedrooms
            thumbnail
            propertyType
          }
        }
        nearby {
          properties {
            propertyId
            title
            region
            district
            monthlyRent
            currency
            bedrooms
            thumbnail
            propertyType
          }
        }
        mostViewed {
          properties {
            propertyId
            title
            region
            district
            monthlyRent
            currency
            bedrooms
            thumbnail
            propertyType
          }
        }
        more {
          properties {
            propertyId
            title
            region
            district
            monthlyRent
            currency
            bedrooms
            thumbnail
            propertyType
          }
        }
      }
    }
  `;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      query,
      variables: { limitPerCategory: 10 },
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  const data = result.data.getCategorizedProperties;

  return {
    nearby: data.nearby?.properties || [],
    lowestPrice: data.lowestPrice?.properties || [],
    mostViewed: data.mostViewed?.properties || [],
    more: data.more?.properties || [],
  };
}

/**
 * Public API
 */
export const api = {
  /**
   * Fetch long-term properties (monthly rentals)
   * Tries CloudFront cache first, falls back to GraphQL
   */
  async fetchLongTermProperties(): Promise<CategorizedProperties> {
    try {
      return await fetchLongTermFromCache();
    } catch (error) {
      console.warn('[API] CloudFront cache failed, falling back to GraphQL:', error);
      return await fetchLongTermViaGraphQL();
    }
  },

  /**
   * Fetch short-term properties (nightly rentals)
   * Tries CloudFront cache first, returns empty on failure
   */
  async fetchShortTermProperties(): Promise<ShortTermCategorizedProperties> {
    try {
      return await fetchShortTermFromCache();
    } catch (error) {
      console.error('[API] Failed to fetch short-term properties:', error);
      // Return empty state instead of throwing
      return {
        lowestPrice: [],
        highestPrice: [],
        topRated: [],
        featured: [],
        recent: [],
      };
    }
  },
};
