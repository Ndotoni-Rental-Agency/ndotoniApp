/**
 * Pagination and scroll configuration constants for React Native
 */
export const PAGINATION = {
  // Property section initial counts
  NEARBY_INITIAL: 16,
  NEARBY_INCREMENT: 12,
  RECENT_INITIAL: 12,
  RECENT_INCREMENT: 8,
  FAVORITES_INITIAL: 10,
  FAVORITES_INCREMENT: 6,
  ALL_PROPERTIES_INITIAL: 10,
  
  // Scroll behavior
  SCROLL_THRESHOLD: 1000,
  SCROLL_AMOUNT: 320,
  
  // Initial fetch
  INITIAL_FETCH_LIMIT: 50,
} as const;
