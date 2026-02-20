/**
 * Property Detail Hook for React Native
 * Fetches property data with CloudFront cache fallback to GraphQL
 */
import { getProperty } from '@/lib/graphql/queries';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Property } from '@/lib/API';
import { getPropertyFromCache } from '@/lib/property-cache';
import { featureFlags } from '@/lib/feature-flags';
import { cachedGraphQL } from '@/lib/cache';

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

      if (!isRetry) {
        const cachedProperty = await getPropertyFromCache(propertyId!);
        
        if (cachedProperty) {
          setProperty(cachedProperty as any);
          setLoading(false);
          setRetryCount(0);
          return;
        }
        
        if (!featureFlags.enableGraphQLFallback) {
          setError('Property not available in cache');
          setLoading(false);
          return;
        }
      }

      // Fallback to GraphQL (only if enabled or retry)
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
        setError('Property not found');
      }

    } catch (err) {
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
