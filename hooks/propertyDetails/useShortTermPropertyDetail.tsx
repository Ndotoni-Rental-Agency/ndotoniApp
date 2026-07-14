import { ShortTermProperty } from '@/lib/API';
import { GraphQLClient } from '@/lib/graphql-client';
import { getShortTermProperty } from '@/lib/graphql/queries';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

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

      if (!propertyId) {
        setError('Property ID is required');
        setLoading(false);
        return;
      }

      console.log('[useShortTermPropertyDetail] 🔍 Fetching property:', propertyId);

      const data = await GraphQLClient.executePublic<{ getShortTermProperty: ShortTermProperty }>(
        getShortTermProperty,
        { propertyId }
      );

      if (data.getShortTermProperty) {
        const propertyData = data.getShortTermProperty;
        console.log('[useShortTermPropertyDetail] ✅ Property loaded:', {
          propertyId: propertyData.propertyId,
          title: propertyData.title,
          status: propertyData.status,
        });
        setProperty(propertyData);
        setRetryCount(0);
      } else {
        setError('This property is no longer available');
        setTimeout(() => { router.back(); }, 2000);
      }
    } catch (err: any) {
      const currentRetryCount = isRetry ? retryCount + 1 : retryCount;
      setRetryCount(currentRetryCount);

      console.error('[useShortTermPropertyDetail] ❌ Error:', err);

      if (err?.message?.includes('Property not found')) {
        setError('This property is no longer available');
        setTimeout(() => { router.back(); }, 2000);
      } else if (currentRetryCount >= 5) {
        setError('Unable to load property after multiple attempts.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load property');
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
    setProperty,
    loading,
    error,
    retry,
    retryCount,
    maxRetries: 5,
  };
}
