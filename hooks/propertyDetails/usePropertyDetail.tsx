/**
 * Property Detail Hook for React Native
 * Fetches property data with CloudFront cache fallback to GraphQL
 */
import { Property } from '@/lib/API';
import { cachedGraphQL } from '@/lib/cache';
import { featureFlags } from '@/lib/feature-flags';
import { getProperty } from '@/lib/graphql/queries';
import { getPropertyFromCache } from '@/lib/property-cache';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export function usePropertyDetail(propertyId?: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  const fetchProperty = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[usePropertyDetail] 🔍 Fetching LONG-TERM property:', propertyId);

      if (!isRetry) {
        const cachedProperty = await getPropertyFromCache(propertyId!);
        
        if (cachedProperty) {
          console.log('[usePropertyDetail] ✅ Got property from CloudFront cache');
          setProperty(cachedProperty as any);
          setLoading(false);
          setRetryCount(0);
          return;
        }
        
        console.log('[usePropertyDetail] ⚠️ CloudFront cache miss, checking fallback...');
        
        if (!featureFlags.enableGraphQLFallback) {
          setError('Property not available in cache');
          setLoading(false);
          return;
        }
        
        console.log('[usePropertyDetail] 🔄 Falling back to GraphQL query');
      }

      // Fallback to GraphQL (only if enabled or retry)
      console.log('[usePropertyDetail] 📡 Executing GraphQL query for property:', propertyId);
      const response = await cachedGraphQL.query({
        query: getProperty,
        variables: { 
          propertyId
        }
      });

      if (response.data.getProperty) {
        setProperty(response.data.getProperty);
        // Reset retry count on successful fetch
        setRetryCount(0);
      } else {
        // Property not found in cache or database
        setError('This property is no longer available');
        setLoading(false);
        
        // Navigate back after 2 seconds
        setTimeout(() => {
          router.back();
        }, 2000);
        return;
      }

    } catch (err: any) {
      // Check if it's a "Property not found" error
      if (err?.message?.includes('Property not found')) {
        setError('This property is no longer available');
        setLoading(false);
        
        // Navigate back after 2 seconds
        setTimeout(() => {
          router.back();
        }, 2000);
        return;
      }
      
      const currentRetryCount = isRetry ? retryCount + 1 : retryCount;
      setRetryCount(currentRetryCount);
      
      if (currentRetryCount >= 5) {
        // After 5 failed attempts, navigate to home
        setError('Unable to load property after multiple attempts. Redirecting to home...');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError('Failed to load property');
      }
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    fetchProperty(true);
  };

  useEffect(() => {
    if (propertyId) {
      setRetryCount(0);
      fetchProperty();
    }
  }, [propertyId]);

  return { 
    property, 
    setProperty, // Expose setProperty for direct updates (e.g., from subscriptions)
    loading, 
    error, 
    retry, 
    retryCount,
    maxRetries: 5 
  };
}
