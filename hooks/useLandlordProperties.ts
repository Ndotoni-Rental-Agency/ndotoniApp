// =============================================================================
// LANDLORD PROPERTIES HOOK
// Hook for fetching and managing landlord properties
// =============================================================================

import { useState, useEffect } from 'react';
import { Property } from '@/lib/API';
import { listLandlordProperties } from '@/lib/graphql/queries';
import { GraphQLClient } from '@/lib/graphql-client';

interface UseLandlordPropertiesReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLandlordProperties(enabled: boolean = true): UseLandlordPropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    if (!enabled) {
      console.log('[useLandlordProperties] ⏸️  Feature disabled, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[useLandlordProperties] 🔄 Fetching long-term properties...');

      const response = await GraphQLClient.executeAuthenticated<{
        listLandlordProperties: {
          properties: Property[];
          nextToken?: string;
          count: number;
        };
      }>(listLandlordProperties, {
        limit: 100,
      });

      console.log('[useLandlordProperties] 📦 Full response object:', response);
      console.log('[useLandlordProperties] 📦 listLandlordProperties:', response.listLandlordProperties);

      console.log('[useLandlordProperties] ✅ Response received:', {
        count: response.listLandlordProperties.count,
        propertiesLength: response.listLandlordProperties.properties?.length || 0,
        hasNextToken: !!response.listLandlordProperties.nextToken,
        hasProperties: !!response.listLandlordProperties.properties,
        propertiesType: typeof response.listLandlordProperties.properties,
        propertiesIsArray: Array.isArray(response.listLandlordProperties.properties),
      });

      // Log each property summary
      response.listLandlordProperties.properties?.forEach((prop, index) => {
        console.log(`[useLandlordProperties] Property ${index + 1}:`, {
          propertyId: prop.propertyId,
          title: prop.title,
          status: prop.status,
          monthlyRent: prop.pricing?.monthlyRent,
          currency: prop.pricing?.currency,
          region: prop.address?.region,
          district: prop.address?.district,
          bedrooms: prop.specifications?.bedrooms,
          images: prop.media?.images?.length || 0,
        });
      });

      setProperties(response.listLandlordProperties.properties || []);
      
      console.log('[useLandlordProperties] ✅ State updated with', 
        response.listLandlordProperties.properties?.length || 0, 
        'properties'
      );
    } catch (err: any) {
      console.error('[useLandlordProperties] ❌ Error fetching properties:', err);
      console.error('[useLandlordProperties] Error details:', {
        message: err instanceof Error ? err.message : String(err),
        name: err?.name,
        stack: err instanceof Error ? err.stack : undefined,
      });
      
      // Check if it's an authentication error
      if (err?.name === 'UserUnAuthenticatedException' || err?.message?.includes('authenticated')) {
        setError('Please sign in to view your properties');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load properties');
      }
    } finally {
      setLoading(false);
      console.log('[useLandlordProperties] 🏁 Fetch complete');
    }
  };

  useEffect(() => {
    if (!enabled) {
      console.log('[useLandlordProperties] ⏸️  Feature disabled, skipping initial fetch');
      return;
    }
    console.log('[useLandlordProperties] 🚀 Hook mounted, starting fetch...');
    fetchProperties();
  }, [enabled]);

  return {
    properties,
    loading,
    error,
    refetch: fetchProperties,
  };
}