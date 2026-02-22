/**
 * Property Type Cache Hook
 * 
 * Fetches property type data from CloudFront cache
 * Supports filtering by property type (HOUSE, VILLA, APARTMENT, etc.)
 */

import { PropertyCard } from '@/lib/API';
import { useCallback, useEffect, useState } from 'react';

const CLOUDFRONT_DOMAIN = process.env.EXPO_PUBLIC_CLOUDFRONT_DOMAIN || 'https://d2bstvyam1bm1f.cloudfront.net';
const STAGE = process.env.EXPO_PUBLIC_STAGE || 'dev';

export interface PropertyTypeData {
  propertyType: string;
  longTerm: PropertyCard[];
  shortTerm: any[]; // Short-term property cards
  generatedAt: string;
  stage: string;
}

export type PropertyType = 'HOUSE' | 'VILLA' | 'APARTMENT' | 'STUDIO' | 'ROOM' | 'GUESTHOUSE' | 'HOTEL' | 'COTTAGE' | 'BUNGALOW' | 'HOSTEL' | 'RESORT' | 'COMMERCIAL';

export function usePropertyTypeCache(propertyType: PropertyType | null) {
  const [data, setData] = useState<PropertyTypeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPropertyTypeData = useCallback(async (type: PropertyType) => {
    setIsLoading(true);
    setError(null);

    try {
      // Normalize property type to lowercase for URL
      const normalizedType = type.toLowerCase();
      const url = `${CLOUDFRONT_DOMAIN}/homepage/${STAGE}/property-types/${normalizedType}.json`;
      
      console.log('[PropertyTypeCache] Fetching from:', url);
      
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'max-age=60',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch property type data: ${response.status}`);
      }
      
      const propertyData = await response.json();
      
      console.log('[PropertyTypeCache] Fetched data:', {
        type: propertyData.propertyType,
        longTermCount: propertyData.longTerm?.length || 0,
        shortTermCount: propertyData.shortTerm?.length || 0,
      });
      
      setData(propertyData);
    } catch (err: any) {
      console.error('[PropertyTypeCache] Error:', err);
      setError(err.message || 'Failed to load property type data');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (propertyType) {
      fetchPropertyTypeData(propertyType);
    } else {
      setData(null);
      setError(null);
    }
  }, [propertyType, fetchPropertyTypeData]);

  const refetch = useCallback(() => {
    if (propertyType) {
      fetchPropertyTypeData(propertyType);
    }
  }, [propertyType, fetchPropertyTypeData]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
