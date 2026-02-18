/**
 * Location Service
 * Fetches location data (regions and districts) from CloudFront
 * with AsyncStorage caching for 30 days
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocationData, FlattenedLocation } from './types';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const CLOUDFRONT_URL = 'https://d2bstvyam1bm1f.cloudfront.net/api/locations-current.json';
const STORAGE_KEY = 'ndotoni_locations';
const STORAGE_TIMESTAMP_KEY = 'ndotoni_locations_timestamp';
const CACHE_DURATION = 30 * ONE_DAY_MS; // 30 days

/**
 * Fetch locations from CloudFront or AsyncStorage cache
 */
export async function fetchLocations(): Promise<LocationData> {
  try {
    const cached = await getCachedLocations();
    if (cached) {
      return cached;
    }

    const response = await fetch(CLOUDFRONT_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.statusText}`);
    }

    const data: LocationData = await response.json();
    await cacheLocations(data);
    
    return data;
  } catch (error) {
    const staleCache = await getStaleCache();
    if (staleCache) {
      return staleCache;
    }
    
    throw new Error('Failed to load locations. Please check your internet connection.');
  }
}

/**
 * Get cached locations if still valid (within 30 days)
 */
async function getCachedLocations(): Promise<LocationData | null> {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_TIMESTAMP_KEY);
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (!timestamp || !data) {
      return null;
    }

    const age = Date.now() - parseInt(timestamp, 10);
    
    if (age > CACHE_DURATION) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

/**
 * Get stale cache (even if expired) as fallback
 */
async function getStaleCache(): Promise<LocationData | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Cache locations in AsyncStorage
 */
async function cacheLocations(data: LocationData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    await AsyncStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    // Silent fail
    console.warn('Failed to cache locations:', error);
  }
}

/**
 * Flatten location data for search
 * Converts hierarchical structure to flat array for easy searching
 */
export function flattenLocations(data: LocationData): FlattenedLocation[] {
  const flattened: FlattenedLocation[] = [];

  for (const [regionName, districts] of Object.entries(data)) {
    // Add region
    flattened.push({
      type: 'region',
      name: regionName,
      displayName: regionName,
    });

    // Add districts
    for (const districtName of districts) {
      flattened.push({
        type: 'district',
        name: districtName,
        regionName: regionName,
        displayName: `${districtName}, ${regionName}`,
      });
    }
  }

  return flattened;
}

/**
 * Search locations by query string
 */
export function searchLocations(
  flattened: FlattenedLocation[],
  query: string
): FlattenedLocation[] {
  if (!query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();

  return flattened.filter(location => 
    location.name.toLowerCase().includes(lowerQuery) ||
    location.displayName.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Clear location cache
 */
export async function clearLocationCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(STORAGE_TIMESTAMP_KEY);
  } catch (error) {
    console.warn('Failed to clear location cache:', error);
  }
}

/**
 * Get cache info
 */
export async function getCacheInfo() {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_TIMESTAMP_KEY);
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (!timestamp || !data) {
      return {
        cached: false,
        age: 0,
        expiresIn: 0,
        regionCount: 0,
      };
    }

    const age = Date.now() - parseInt(timestamp, 10);
    const expiresIn = Math.max(0, CACHE_DURATION - age);
    const parsed: LocationData = JSON.parse(data);
    const regionCount = Object.keys(parsed).length;
    const districtCount = Object.values(parsed).reduce((sum, districts) => sum + districts.length, 0);

    return {
      cached: true,
      age,
      ageHours: Math.floor(age / (60 * 60 * 1000)),
      ageDays: Math.floor(age / (24 * 60 * 60 * 1000)),
      expiresIn,
      expiresInDays: Math.floor(expiresIn / (24 * 60 * 60 * 1000)),
      regionCount,
      districtCount,
      isExpired: age > CACHE_DURATION,
    };
  } catch (error) {
    return {
      cached: false,
      age: 0,
      expiresIn: 0,
      regionCount: 0,
    };
  }
}
