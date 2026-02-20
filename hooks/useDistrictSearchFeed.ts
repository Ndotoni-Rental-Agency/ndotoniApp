/**
 * Hook for fetching district search feeds with CloudFront-first strategy
 * Falls back to GraphQL only if feature flag is enabled
 */

import { PropertyCard } from '@/lib/API';
import { cachedGraphQL } from '@/lib/cache';
import { featureFlags } from '@/lib/feature-flags';
import { getPropertiesByLocation } from '@/lib/graphql/queries';
import { getDistrictSearchFeedPage } from '@/lib/property-cache';
import { useState, useEffect } from 'react';

interface UseDistrictSearchFeedOptions {
  region: string;
  district: string;
  page?: number;
  enabled?: boolean; // Allow lazy loading
}

interface UseDistrictSearchFeedResult {
  properties: PropertyCard[];
  loading: boolean;
  error: string | null;
  nextToken: string | null;
  total: number;
  fromCloudFront: boolean;
  refetch: () => void;
}

export function useDistrictSearchFeed({
  region,
  district,
  page = 1,
  enabled = true,
}: UseDistrictSearchFeedOptions): UseDistrictSearchFeedResult {
  const [properties, setProperties] = useState<PropertyCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [fromCloudFront, setFromCloudFront] = useState(false);

  const fetchFeed = async () => {
    if (!enabled || !region || !district) return;

    try {
      setLoading(true);
      setError(null);
      setFromCloudFront(false);

      const cachedFeed = await getDistrictSearchFeedPage(region, district, page);
      
      if (cachedFeed) {
        // Add __typename to each property for GraphQL compatibility
        const propertiesWithTypename = cachedFeed.properties.map(p => ({
          ...p,
          __typename: 'PropertyCard' as const,
          propertyType: p.propertyType as any, // Cast to PropertyType enum
        }));
        
        setProperties(propertiesWithTypename as PropertyCard[]);
        setNextToken(cachedFeed.nextToken);
        setTotal(cachedFeed.total);
        setFromCloudFront(true);
        setLoading(false);
        return;
      }
      
      if (!featureFlags.enableGraphQLFallback) {
        setProperties([]);
        setNextToken(null);
        setTotal(0);
        setError('Properties not available in cache');
        setLoading(false);
        return;
      }

      const response = await cachedGraphQL.query({
        query: getPropertiesByLocation,
        variables: {
          region,
          district,
          limit: 20,
        },
      });

      if (response.data?.getPropertiesByLocation?.properties) {
        // Map to PropertyCard format
        const cards: PropertyCard[] = response.data.getPropertiesByLocation.properties.map((p: any) => ({
          propertyId: p.propertyId,
          title: p.title,
          monthlyRent: p.pricing?.monthlyRent || 0,
          currency: p.pricing?.currency || 'TZS',
          propertyType: p.propertyType,
          bedrooms: p.specifications?.bedrooms,
          district: p.address?.district || '',
          region: p.address?.region || '',
          thumbnail: p.media?.images?.[0],
        }));

        setProperties(cards);
        setNextToken(response.data.getPropertiesByLocation.nextToken || null);
        setTotal(cards.length);
        setFromCloudFront(false);
      } else {
        setProperties([]);
        setNextToken(null);
        setTotal(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load properties';
      setError(errorMessage);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [region, district, page, enabled]);

  return {
    properties,
    loading,
    error,
    nextToken,
    total,
    fromCloudFront,
    refetch: fetchFeed,
  };
}
