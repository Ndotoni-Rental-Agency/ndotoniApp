import { useState, useEffect, useRef, useCallback } from 'react';
import { getRelatedProperties } from '@/lib/graphql/queries';
import { PropertyCard } from '@/lib/API';
import { cachedGraphQL } from '@/lib/cache';

interface RelatedPropertiesData {
  landlordProperties: PropertyCard[];
  similarLocationProperties: PropertyCard[];
  similarPriceProperties: PropertyCard[];
}

interface GetRelatedPropertiesResponse {
  getRelatedProperties: {
    landlordProperties: PropertyCard[];
    similarLocationProperties: PropertyCard[];
    similarPriceProperties: PropertyCard[];
  };
}

interface UseRelatedPropertiesOptions {
  /**
   * Enable lazy loading - only fetch when element is visible
   * Default: false (fetch immediately)
   */
  lazy?: boolean;
  /**
   * Root margin for Intersection Observer (e.g., '200px' to load 200px before visible)
   * Default: '0px'
   */
  rootMargin?: string;
}

export function useRelatedProperties(
  propertyId: string | null,
  options: UseRelatedPropertiesOptions = {}
) {
  const { lazy = false, rootMargin = '0px' } = options;
  
  const [data, setData] = useState<RelatedPropertiesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldFetch, setShouldFetch] = useState(!lazy);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasFetchedRef = useRef(false);

  const elementRef = useCallback((node: HTMLElement | null) => {
    if (!lazy) {
      return;
    }
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!node) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry.isIntersecting && !hasFetchedRef.current) {
          setShouldFetch(true);
          hasFetchedRef.current = true;
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0.1,
      }
    );

    observerRef.current.observe(node);
  }, [lazy, rootMargin]);

  useEffect(() => {
    if (!propertyId || !shouldFetch) {
      setData(null);
      return;
    }

    let isMounted = true;

    const fetchRelatedProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await cachedGraphQL.query<GetRelatedPropertiesResponse>({
          query: getRelatedProperties,
          variables: {
            propertyId,
            landlordLimit: 6,
            locationLimit: 10,
            priceLimit: 10,
          },
        });

        if (isMounted && response.data.getRelatedProperties) {
          const relatedData = {
            landlordProperties: response.data.getRelatedProperties.landlordProperties || [],
            similarLocationProperties: response.data.getRelatedProperties.similarLocationProperties || [],
            similarPriceProperties: response.data.getRelatedProperties.similarPriceProperties || [],
          };

          setData(relatedData);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load related properties');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRelatedProperties();

    return () => {
      isMounted = false;
    };
  }, [propertyId, shouldFetch]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { data, loading, error, ref: elementRef };
}
