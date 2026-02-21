# Property Details Geocoding Migration

## Overview
Migrated property details pages to use the new unified geocoding service with improved fallback strategies and ward-level support.

## Changes Made

### 1. Long-Term Property Details (`app/property/[id].tsx`)
- Replaced manual coordinate fetching with `usePropertyGeocode()` hook
- Removed `getApproximateCoordinates` import from old `@/lib/geocoding`
- Removed manual `useEffect` and `fetchCoordinates` function
- Simplified state management (removed `coordinates` state, now from hook)

### 2. Short-Term Property Details (`app/short-property/[id].tsx`)
- Replaced manual coordinate fetching with `usePropertyGeocode()` hook
- Removed `getApproximateCoordinates` import from old `@/lib/geocoding`
- Removed manual `useEffect` and `fetchCoordinates` function
- Simplified state management (removed `coordinates` state, now from hook)

## Benefits

### Unified Geocoding Strategy
Both pages now use the same 5-tier fallback system:
1. Saved coordinates (from database)
2. Nominatim/OpenStreetMap (free, most accurate for real addresses)
3. Google Geocoding API (accurate, backup when Nominatim fails)
4. Local Tanzania database (instant, reliable fallback)
5. Tanzania center (always works)

### Ward-Level Support
The new system properly prioritizes:
- Ward coordinates (most specific)
- District coordinates (fallback)
- Region coordinates (fallback)

### Automatic Updates
The `usePropertyGeocode` hook automatically:
- Detects property structure (long-term vs short-term)
- Handles both `address.coordinates` and flat `coordinates`
- Re-geocodes when property data changes
- Provides loading states and error handling

### Code Simplification
- Removed ~40 lines of duplicate coordinate fetching logic per file
- Eliminated manual state management for coordinates
- Consistent behavior across all property views

## Testing Checklist

- [ ] Long-term property details show correct map location
- [ ] Short-term property details show correct map location
- [ ] Properties with saved coordinates use them directly
- [ ] Properties without coordinates fall back to local database
- [ ] Ward-level addresses show more precise locations
- [ ] Map displays correctly for Dar es Salaam wards
- [ ] Map displays correctly for other regions

## Related Files
- `lib/geocoding-service.ts` - Core geocoding service
- `hooks/useGeocode.ts` - React hooks for geocoding
- `config/tanzania-locations.ts` - Local coordinates database
- `components/property/MapCoordinatesPicker.tsx` - Map picker component

## Old System (Deprecated)
- `lib/geocoding.ts` - Old geocoding utility (can be removed)
- `hooks/propertyDetails/usePropertyCoordinates.tsx` - Old hook (can be removed)

## Next Steps
1. Test property details pages with various locations
2. Add more ward-level coordinates for major cities
3. Consider removing old geocoding files after verification
4. Monitor geocoding performance and accuracy
