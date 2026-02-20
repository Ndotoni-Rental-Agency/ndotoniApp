/**
 * Feature Flags Configuration
 * 
 * Centralized feature flag management for gradual rollout and A/B testing.
 */

export interface FeatureFlags {
  shortTermStays: boolean;
  facebookSignIn: boolean;
  // Add more feature flags here as needed
}

/**
 * Get feature flags from environment variables
 * Defaults to disabled, can be enabled via env vars
 */
export const featureFlags: FeatureFlags = {
  // Short-term stays (hotels, vacation rentals, nightly bookings)
  // Disabled by default - set NEXT_PUBLIC_ENABLE_SHORT_TERM_STAYS=true to enable
  shortTermStays: process.env.NEXT_PUBLIC_ENABLE_SHORT_TERM_STAYS !== 'true',
  
  // Facebook Sign-In
  // Disabled by default - set NEXT_PUBLIC_ENABLE_FACEBOOK_SIGNIN=true to enable
  facebookSignIn: process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_SIGNIN === 'true',
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Property rental types
 */
export enum RentalType {
  LONG_TERM = 'LONG_TERM',   // Monthly rentals
  SHORT_TERM = 'SHORT_TERM',  // Nightly rentals (hotels, vacation rentals)
}

export const rentalTypeLabels = {
  [RentalType.LONG_TERM]: {
    en: 'Monthly',
    sw: 'Kila Mwezi',
  },
  [RentalType.SHORT_TERM]: {
    en: 'Nightly',
    sw: 'Kila Usiku',
  },
};
