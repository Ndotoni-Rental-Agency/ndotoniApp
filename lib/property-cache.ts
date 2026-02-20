/**
 * Property Cache Utility for React Native
 * Fetches property data from CloudFront for instant loads
 * Always tries CloudFront first, falls back to GraphQL automatically
 */

const CDN_URL = process.env.EXPO_PUBLIC_CLOUDFRONT_DOMAIN || 'https://d2bstvyam1bm1f.cloudfront.net';

export interface PropertyCacheData {
  propertyId: string;
  title: string;
  description: string;
  propertyType: string;
  status: string;
  pricing: {
    monthlyRent?: number;
    currency?: string;
  };
  address: {
    region?: string;
    district?: string;
    ward?: string;
    street?: string;
  };
  specifications: {
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
  };
  media: {
    images?: Array<{ url: string; alt?: string }>;
    thumbnail?: string;
  };
  landlordId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyCard {
  propertyId: string;
  title: string;
  monthlyRent: number;
  currency: string;
  propertyType: string;
  bedrooms?: number;
  district: string;
  region: string;
  thumbnail?: string;
}

export interface DistrictSearchFeed {
  region: string;
  district: string;
  total: number;
  properties: PropertyCard[];
  nextToken: string | null;
}

export interface RegionSearchFeed {
  region: string;
  total: number;
  properties: PropertyCard[];
  nextToken: string | null;
}

/**
 * Clean escaped quotes from string fields
 */
function cleanEscapedString(value: string | undefined): string {
  if (!value) return '';
  
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  
  return value;
}

/**
 * Normalize image array format
 */
function normalizeImageArray(images: any): string[] {
  if (!Array.isArray(images)) {
    return [];
  }
  
  return images.map(img => {
    if (typeof img === 'string') {
      return cleanEscapedString(img);
    }
    
    if (img && typeof img === 'object' && img.url) {
      return cleanEscapedString(img.url);
    }
    
    return String(img);
  }).filter(Boolean);
}

/**
 * Recursively clean all string fields in an object
 */
function cleanObjectStrings<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObjectStrings(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'images' && Array.isArray(value)) {
        cleaned[key] = normalizeImageArray(value);
      } else if (typeof value === 'string') {
        cleaned[key] = cleanEscapedString(value);
      } else if (typeof value === 'object' && value !== null) {
        cleaned[key] = cleanObjectStrings(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned as T;
  }
  
  return obj;
}

/**
 * Fetch a single property from CloudFront cache
 * Returns null if not found (fallback to DB query)
 */
export async function getPropertyFromCache(propertyId: string): Promise<PropertyCacheData | null> {
  const url = `${CDN_URL}/properties/${propertyId}.json`;
  
  try {
    const response = await fetch(url, {
      cache: 'default'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const cleanedData = cleanObjectStrings(data);
    
    return cleanedData;
  } catch (error) {
    console.error('[property-cache] Error fetching from cache:', error);
    return null;
  }
}

/**
 * Get CloudFront URL for a property JSON
 */
export function getPropertyCacheUrl(propertyId: string): string {
  return `${CDN_URL}/properties/${propertyId}.json`;
}

/**
 * Fetch district search feed from CloudFront (page 1 only)
 * Returns property cards + nextToken for pagination
 */
export async function getDistrictSearchFeedPage(
  region: string,
  district: string,
  page: number
): Promise<DistrictSearchFeed | null> {
  if (page !== 1) {
    return null;
  }
  
  const sanitizedRegion = region.toLowerCase().replace(/\s+/g, '-');
  const sanitizedDistrict = district.toLowerCase().replace(/\s+/g, '-');
  const url = `${CDN_URL}/search/district/${sanitizedRegion}/${sanitizedDistrict}/page-1.json`;
  
  try {
    const response = await fetch(url, {
      cache: 'default'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const cleanedData = cleanObjectStrings(data);
    
    return cleanedData;
  } catch (error) {
    console.error('[property-cache] Error fetching district search feed:', error);
    return null;
  }
}

/**
 * Fetch region search feed from CloudFront (page 1 only)
 * Returns property cards + nextToken for pagination
 */
export async function getRegionSearchFeed(
  region: string
): Promise<RegionSearchFeed | null> {
  const sanitizedRegion = region.toLowerCase().replace(/\s+/g, '-');
  const url = `${CDN_URL}/search/region/${sanitizedRegion}.json`;
  
  try {
    const response = await fetch(url, {
      cache: 'default'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const cleanedData = cleanObjectStrings(data);
    
    return cleanedData;
  } catch (error) {
    console.error('[property-cache] Error fetching region search feed:', error);
    return null;
  }
}

/**
 * Get CloudFront URL for a district search feed page
 */
export function getDistrictSearchFeedUrl(region: string, district: string, page: number): string {
  const sanitizedRegion = region.toLowerCase().replace(/\s+/g, '-');
  const sanitizedDistrict = district.toLowerCase().replace(/\s+/g, '-');
  return `${CDN_URL}/search/district/${sanitizedRegion}/${sanitizedDistrict}/page-${page}.json`;
}
