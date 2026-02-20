/**
 * Feature Flags Configuration for React Native
 * 
 * Centralized feature flag management for gradual rollout of new features.
 * All flags default to false for safety.
 */

export interface FeatureFlags {
  // Property Caching
  enableGraphQLFallback: boolean;        // Enable GraphQL fallback when CloudFront cache misses
  
  // Performance
  enablePropertySubscriptions: boolean; // Real-time property updates
  enableLazyLoading: boolean;          // Lazy load images and components
  
  // Future features (placeholders)
  enablePropertyComparison: boolean;
  enableSavedSearches: boolean;
}

/**
 * Get feature flags from environment variables
 * GraphQL fallback enabled by default for filtered searches
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    // Property Caching - Enable GraphQL fallback for filtered searches
    enableGraphQLFallback: process.env.EXPO_PUBLIC_ENABLE_GRAPHQL_FALLBACK !== 'false', // Default true
    
    // Performance features
    enablePropertySubscriptions: process.env.EXPO_PUBLIC_ENABLE_PROPERTY_SUBSCRIPTIONS !== 'false', // Default true
    enableLazyLoading: process.env.EXPO_PUBLIC_ENABLE_LAZY_LOADING !== 'false', // Default true
    
    // Future features
    enablePropertyComparison: process.env.EXPO_PUBLIC_ENABLE_PROPERTY_COMPARISON === 'true',
    enableSavedSearches: process.env.EXPO_PUBLIC_ENABLE_SAVED_SEARCHES === 'true',
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

// Export singleton instance
export const featureFlags = getFeatureFlags();
