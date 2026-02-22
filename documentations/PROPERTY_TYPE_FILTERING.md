# Property Type Filtering on Homepage

## Overview
The homepage now supports filtering properties by type (HOUSE, VILLA, APARTMENT, STUDIO) using CloudFront cached data. When users tap on a property type category, the app fetches pre-generated property lists from CloudFront for instant loading.

## Implementation

### New Hook: `usePropertyTypeCache`
Location: `hooks/usePropertyTypeCache.ts`

Fetches property type data from CloudFront:
```typescript
const { data, isLoading, error, refetch } = usePropertyTypeCache('HOUSE');
```

**CloudFront URL Pattern:**
```
https://{cloudfront-domain}/homepage/{stage}/property-types/{type}.json
```

Example: `https://d2bstvyam1bm1f.cloudfront.net/homepage/dev/property-types/house.json`

**Data Structure:**
```json
{
  "propertyType": "HOUSE",
  "longTerm": [...],
  "shortTerm": [...],
  "generatedAt": "2024-01-15T10:30:00Z",
  "stage": "dev"
}
```

### Homepage Integration
Location: `app/(tabs)/index.tsx`

**Changes:**
1. Added `selectedPropertyType` state to track which property type is selected
2. Integrated `usePropertyTypeCache` hook
3. Updated category buttons to set property type filter
4. Modified `getPropertiesByCategory()` to return property type data when selected
5. Updated refresh logic to handle property type refetching

**Category Buttons:**
- Monthly/Nightly: Switch rental types, show categorized view
- Houses/Apartments/Villas/Studios: Set property type filter
- Hotels/Guesthouses/Rooms/Cottages: Set property type filter (typically short-term)

**Behavior:**
- When a property type is selected, properties of that type from BOTH rental types are shown
- Properties display their actual rental type (monthly or nightly) regardless of the current rental type filter
- Monthly/Nightly buttons switch between categorized views (not property type views)
- Property types are independent of rental type selection

## Supported Property Types

### Common Types (Both Rental Types)
- `HOUSE` - Standalone houses
- `APARTMENT` - Apartment units
- `VILLA` - Luxury villas
- `STUDIO` - Studio apartments
- `ROOM` - Single rooms

### Short-term Only
- `GUESTHOUSE` - Guest houses
- `HOTEL` - Hotel rooms
- `COTTAGE` - Cottages

### Long-term Only
- `COMMERCIAL` - Commercial properties

## User Flow

1. User opens homepage → sees categorized properties (default view)
2. User taps "Houses" → fetches house.json from CloudFront
3. Homepage shows all houses (both long-term and short-term mixed together)
4. Each property card shows its actual rental type (monthly or nightly)
5. User taps "Monthly" or "Nightly" → returns to categorized view filtered by rental type
6. User taps another property type → shows all properties of that type

## Performance

- **Cache Hit**: <100ms (CloudFront global edge)
- **Cache Miss**: ~2-3 seconds (regenerate from Lambda)
- **Cache Duration**: 30 minutes
- **Data Size**: ~10-50KB per property type

## Benefits

1. **Fast Loading**: CloudFront cache provides instant property type filtering
2. **Unified View**: Single endpoint for both rental types
3. **Scalable**: No database queries for property type browsing
4. **Fresh Data**: 30-minute cache ensures recent properties are shown
5. **Fallback Ready**: Error handling with retry button

## Future Enhancements

1. Add more property types (TOWNHOUSE, PENTHOUSE, etc.)
2. Support combined filters (e.g., Houses in Dar es Salaam)
3. Add property count badges to category buttons
4. Implement infinite scroll for property type results
5. Add property type statistics (avg price, availability, etc.)

## Related Files

- `hooks/usePropertyTypeCache.ts` - Property type cache hook
- `app/(tabs)/index.tsx` - Homepage with property type filtering
- `lib/homepage-cache.ts` - Homepage cache utilities
- Backend: `packages/lambda/src/handlers/homepage-cache-step-function.ts`
