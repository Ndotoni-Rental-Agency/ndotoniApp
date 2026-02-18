/**
 * Location Types
 * Shared types for location data across the app
 */

export interface LocationData {
  [regionName: string]: string[]; // region -> array of districts
}

export interface FlattenedLocation {
  type: 'region' | 'district';
  name: string;
  regionName?: string; // Only for districts
  displayName: string; // For search display
}
