import { useEffect, useRef, useCallback } from 'react';

interface UseHorizontalScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

export function useHorizontalScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200
}: UseHorizontalScrollOptions) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore || isLoading) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const scrolledToEnd = scrollLeft + clientWidth >= scrollWidth - threshold;

    if (scrolledToEnd) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore, threshold]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return { scrollContainerRef };
}