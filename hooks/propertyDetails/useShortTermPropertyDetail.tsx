import { ShortTermProperty } from '@/lib/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

const CLOUDFRONT_DOMAIN = process.env.EXPO_PUBLIC_CLOUDFRONT_DOMAIN || 'https://d2bstvyam1bm1f.cloudfront.net';
const S3_FALLBACK_DOMAIN = 'https://ndotoni-media-storage-dev.s3.us-west-2.amazonaws.com';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_KEY_PREFIX = 'short-term-property-';

interface CachedProperty {
  data: ShortTermProperty;
  timestamp: number;
}

// Get cached property from AsyncStorage
async function getCachedProperty(propertyId: string): Promise<ShortTermProperty | null> {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${propertyId}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const { data, timestamp }: CachedProperty = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid (within 5 minutes)
    if (now - timestamp < CACHE_DURATION) {
      console.log('[useShortTermPropertyDetail] 📦 Using cached property', {
        propertyId,
        age: `${Math.round((now - timestamp) / 1000)}s`,
        expiresIn: `${Math.round((CACHE_DURATION - (now - timestamp)) / 1000)}s`,
      });
      return data;
    }
    
    // Cache expired, remove it
    await AsyncStorage.removeItem(cacheKey);
    return null;
  } catch (error) {
    console.error('[useShortTermPropertyDetail] Failed to read cache', error);
    return null;
  }
}

// Save property to AsyncStorage cache
async function setCachedProperty(propertyId: string, property: ShortTermProperty): Promise<void> {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${propertyId}`;
    const cached: CachedProperty = {
      data: property,
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cached));
    console.log('[useShortTermPropertyDetail] 💾 Property cached', { propertyId });
  } catch (error) {
    console.error('[useShortTermPropertyDetail] Failed to cache property', error);
  }
}

// Clear cached property
async function clearCachedProperty(propertyId: string): Promise<void> {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${propertyId}`;
    await AsyncStorage.removeItem(cacheKey);
    console.log('[useShortTermPropertyDetail] 🗑️ Cache cleared', { propertyId });
  } catch (error) {
    console.error('[useShortTermPropertyDetail] Failed to clear cache', error);
  }
}

export function useShortTermPropertyDetail(propertyId?: string) {
  const [property, setProperty] = useState<ShortTermProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  const fetchProperty = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[useShortTermPropertyDetail] 🔍 Fetching SHORT-TERM property:', propertyId);

      if (!propertyId) {
        setError('Property ID is required');
        setLoading(false);
        return;
      }

      // Check cache first
      const cachedProperty = await getCachedProperty(propertyId);
      if (cachedProperty) {
        console.log('[useShortTermPropertyDetail] ✅ Got property from AsyncStorage cache');
        setProperty(cachedProperty);
        setLoading(false);
        
        // Fetch in background to update cache if needed
        fetchFromCloudFront(propertyId, true);
        return;
      }

      console.log('[useShortTermPropertyDetail] ⚠️ AsyncStorage cache miss, fetching from CloudFront...');
      
      // Fetch from CloudFront
      await fetchFromCloudFront(propertyId, false);

    } catch (err) {
      const currentRetryCount = isRetry ? retryCount + 1 : retryCount;
      setRetryCount(currentRetryCount);
      
      console.error('[useShortTermPropertyDetail] ❌ Error:', err);
      
      if (currentRetryCount >= 5) {
        // After 5 failed attempts, navigate to home
        setError('Unable to load property after multiple attempts. Redirecting to home...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load property');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFromCloudFront = async (propertyId: string, isBackground: boolean) => {
    const url = `${CLOUDFRONT_DOMAIN}/short-term-properties/${propertyId}.json`;
    
    if (!isBackground) {
      console.log('[useShortTermPropertyDetail] 🌐 Full CloudFront URL:', url);
      console.log('[useShortTermPropertyDetail] 📍 CLOUDFRONT_DOMAIN:', CLOUDFRONT_DOMAIN);
      console.log('[useShortTermPropertyDetail] 🆔 Property ID:', propertyId);
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store', // Always fetch fresh data
      });

      if (!isBackground) {
        console.log('[useShortTermPropertyDetail] 📡 Response status:', response.status);
        console.log('[useShortTermPropertyDetail] 📡 Response ok:', response.ok);
      }

      if (!response.ok) {
        if (response.status === 404) {
          console.log('[useShortTermPropertyDetail] ❌ CloudFront 404 - property not in CloudFront cache');
          
          // Try S3 fallback
          if (!isBackground) {
            console.log('[useShortTermPropertyDetail] 🔄 Trying S3 fallback...');
            await fetchFromS3Fallback(propertyId);
            return;
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();

      // Check if property was deleted
      if (data.deleted) {
        setError('This property is no longer available');
        setLoading(false);
        
        // Navigate back after 2 seconds
        setTimeout(() => {
          router.back();
        }, 2000);
        return;
      }

      const propertyData = data as ShortTermProperty;
      
      // Update state and cache
      setProperty(propertyData);
      setCachedProperty(propertyId, propertyData);
      setRetryCount(0);

      if (!isBackground) {
        console.log('[useShortTermPropertyDetail] ✅ Property loaded from CloudFront:', {
          propertyId: propertyData.propertyId,
          title: propertyData.title,
          status: propertyData.status,
        });
      }
    } catch (error) {
      console.error('[useShortTermPropertyDetail] ❌ CloudFront fetch error:', error);
      
      // Try S3 fallback on error
      if (!isBackground) {
        console.log('[useShortTermPropertyDetail] 🔄 Trying S3 fallback after error...');
        await fetchFromS3Fallback(propertyId);
      }
    }
  };

  const fetchFromS3Fallback = async (propertyId: string) => {
    console.log('[useShortTermPropertyDetail] 🪣 Attempting S3 fallback via GraphQL...');
    
    try {
      // Import GraphQL query dynamically to avoid circular dependencies
      const { getShortTermProperty } = await import('@/lib/graphql/queries');
      const { GraphQLClient } = await import('@/lib/graphql-client');
      
      console.log('[useShortTermPropertyDetail] 📡 Fetching via GraphQL API...');
      
      const data = await GraphQLClient.executePublic<{ getShortTermProperty: ShortTermProperty }>(
        getShortTermProperty,
        { propertyId }
      );

      if (data.getShortTermProperty) {
        console.log('[useShortTermPropertyDetail] ✅ Property loaded from GraphQL fallback');
        const propertyData = data.getShortTermProperty;
        
        // Update state and cache
        setProperty(propertyData);
        setCachedProperty(propertyId, propertyData);
        setRetryCount(0);
      } else {
        setError('This property is no longer available');
        setLoading(false);
        
        // Navigate back after 2 seconds
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (error: any) {
      console.error('[useShortTermPropertyDetail] ❌ S3 fallback failed:', error);
      
      if (error?.message?.includes('Property not found')) {
        setError('This property is no longer available');
        setLoading(false);
        
        // Navigate back after 2 seconds
        setTimeout(() => {
          router.back();
        }, 2000);
      } else {
        throw error;
      }
    }
  };

  const retry = () => {
    fetchProperty(true);
  };

  // Custom setProperty that also updates cache
  const setPropertyWithCache = (newProperty: ShortTermProperty) => {
    setProperty(newProperty);
    setCachedProperty(newProperty.propertyId, newProperty); // Fire and forget
  };

  useEffect(() => {
    if (propertyId) {
      setRetryCount(0);
      fetchProperty();
    }
  }, [propertyId]);

  return { 
    property, 
    setProperty: setPropertyWithCache,
    loading, 
    error, 
    retry, 
    retryCount,
    maxRetries: 5,
    clearCache: () => propertyId && clearCachedProperty(propertyId),
  };
}
