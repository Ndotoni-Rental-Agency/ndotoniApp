import { useState, useEffect } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyShortTermProperties } from '@/lib/graphql/queries';
import { ShortTermProperty } from '@/lib/API';

interface ShortTermPropertiesResult {
  properties: ShortTermProperty[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLandlordShortTermProperties(enabled: boolean = true): ShortTermPropertiesResult {
  const [properties, setProperties] = useState<ShortTermProperty[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    if (!enabled) {
      console.log('[useLandlordShortTermProperties] ⏸️  Feature disabled, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[useLandlordShortTermProperties] 🔄 Fetching short-term properties...');

      const response = await GraphQLClient.executeAuthenticated<{
        listMyShortTermProperties: {
          properties: ShortTermProperty[];
          nextToken?: string;
          count: number;
        };
      }>(listMyShortTermProperties, {
        limit: 100,
      });

      console.log('[useLandlordShortTermProperties] 📦 Full response object:', response);
      console.log('[useLandlordShortTermProperties] 📦 listMyShortTermProperties:', response.listMyShortTermProperties);
      console.log('[useLandlordShortTermProperties] 📦 Response keys:', Object.keys(response.listMyShortTermProperties || {}));

      console.log('[useLandlordShortTermProperties] ✅ Response received:', {
        count: response.listMyShortTermProperties.count,
        propertiesLength: response.listMyShortTermProperties.properties?.length || 0,
        hasNextToken: !!response.listMyShortTermProperties.nextToken,
        hasProperties: !!response.listMyShortTermProperties.properties,
        propertiesType: typeof response.listMyShortTermProperties.properties,
        propertiesIsArray: Array.isArray(response.listMyShortTermProperties.properties),
      });

      console.log('[useLandlordShortTermProperties] 📋 Properties data:', 
        JSON.stringify(response.listMyShortTermProperties.properties, null, 2)
      );

      // Log each property summary
      response.listMyShortTermProperties.properties?.forEach((prop, index) => {
        console.log(`[useLandlordShortTermProperties] Property ${index + 1}:`, {
          propertyId: prop.propertyId,
          title: prop.title,
          status: prop.status,
          nightlyRate: prop.nightlyRate,
          currency: prop.currency,
          region: prop.region,
          district: prop.district,
          maxGuests: prop.maxGuests,
          images: prop.images?.length || 0,
          thumbnail: prop.thumbnail,
        });
      });

      setProperties(response.listMyShortTermProperties.properties || []);
      
      console.log('[useLandlordShortTermProperties] ✅ State updated with', 
        response.listMyShortTermProperties.properties?.length || 0, 
        'properties'
      );
    } catch (err) {
      console.error('[useLandlordShortTermProperties] ❌ Error fetching properties:', err);
      console.error('[useLandlordShortTermProperties] Error details:', {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        fullError: err,
      });
      setError(err instanceof Error ? err.message : 'Failed to load short-term properties');
    } finally {
      setLoading(false);
      console.log('[useLandlordShortTermProperties] 🏁 Fetch complete');
    }
  };

  useEffect(() => {
    if (!enabled) {
      console.log('[useLandlordShortTermProperties] ⏸️  Feature disabled, skipping initial fetch');
      return;
    }
    console.log('[useLandlordShortTermProperties] 🚀 Hook mounted, starting fetch...');
    fetchProperties();
  }, [enabled]);

  return {
    properties,
    loading,
    error,
    refetch: fetchProperties,
  };
}
