# GraphQL Client Migration Complete ✅

## Overview
Successfully migrated from the custom `api-client.ts` wrapper to using CloudFront cache for homepage data and `graphql-client.ts` directly with auto-generated queries for search functionality.

## Changes Made

### 1. Removed API Client Layer
- **Deleted**: `ndotoniApp/lib/api-client.ts`
- This wrapper layer was redundant since we have auto-generated queries

### 2. Created CloudFront Cache Client (`lib/homepage-cache.ts`)
**New file** for fetching pre-generated property data from CloudFront CDN:
- `fetchLongTermHomepageCache()` - Fetches long-term properties from CloudFront
- `fetchShortTermHomepageCache()` - Fetches short-term properties from CloudFront
- Fast loading with CDN caching
- Matches web app architecture

### 3. Updated Home Screen (`app/(tabs)/index.tsx`)
**Before:**
```typescript
import { api } from '@/lib/api-client';
const data = await api.fetchLongTermProperties();
```

**After:**
```typescript
import { fetchLongTermHomepageCache, fetchShortTermHomepageCache } from '@/lib/homepage-cache';

// For long-term
const cache = await fetchLongTermHomepageCache();
setLongTermProperties({
  lowestPrice: cache.lowestPrice || [],
  nearby: cache.nearby || [],
});

// For short-term
const cache = await fetchShortTermHomepageCache();
setShortTermProperties({
  lowestPrice: cache.lowestPrice || [],
  topRated: cache.topRated || [],
  featured: cache.featured || [],
});
```

### 4. Updated Search Screen (`app/search.tsx`)
**Before:**
```typescript
import { api } from '@/lib/api-client';
const result = await api.searchShortTermProperties({ ... });
```

**After:**
```typescript
import GraphQLClient from '@/lib/graphql-client';
import { searchShortTermProperties, getPropertiesByLocation } from '@/lib/graphql/queries';

const data = await GraphQLClient.executePublic<{ searchShortTermProperties: any }>(
  searchShortTermProperties,
  { input: { region, district, checkInDate, checkOutDate } }
);
```

### 5. Fixed TypeScript Configuration
Added `forceConsistentCasingInFileNames: true` to `tsconfig.json` to prevent case-sensitivity issues between `API.ts` and `api.ts`.

## Benefits

### CloudFront CDN for Homepage
- Fast loading with edge caching
- Pre-generated property data
- Reduced load on GraphQL API
- Same architecture as web app

### Direct Query Usage for Search
- Use auto-generated queries directly from `lib/graphql/queries.ts`
- No manual query string writing
- Type-safe with TypeScript

### Simplified Architecture
```
Homepage: Component → CloudFront CDN → JSON Cache
Search:   Component → graphql-client → GraphQL API
```

### Better Type Safety
Generated queries include TypeScript types:
```typescript
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};
```

## Available Queries

### Property Queries
- `getCategorizedProperties` - Get properties by category (nearby, lowest price, etc.)
- `getPropertiesByLocation` - Search long-term properties by location
- `searchShortTermProperties` - Search short-term properties
- `getProperty` - Get single long-term property details
- `getShortTermProperty` - Get single short-term property details
- `getPropertiesByCategory` - Get properties by specific category

### User Queries
- `getMe` - Get current user profile
- `getUserById` - Get user by ID
- `getUserByEmail` - Get user by email

### Booking Queries
- `getBooking` - Get booking details
- `listMyBookings` - List user's bookings
- `checkAvailability` - Check property availability
- `calculateBookingPrice` - Calculate booking price

### Location Queries
- `getRegions` - Get all regions
- `getDistricts` - Get districts by region
- `getWards` - Get wards by district
- `getStreets` - Get streets by ward

## Usage Pattern

### Homepage Data (CloudFront Cache)
```typescript
import { fetchLongTermHomepageCache, fetchShortTermHomepageCache } from '@/lib/homepage-cache';

// Long-term properties
const longTermCache = await fetchLongTermHomepageCache();
const properties = longTermCache.lowestPrice; // or .nearby, .mostViewed, etc.

// Short-term properties
const shortTermCache = await fetchShortTermHomepageCache();
const properties = shortTermCache.lowestPrice; // or .topRated, .featured, etc.
```

### Search Queries (GraphQL)
### Search Queries (GraphQL)
```typescript
import GraphQLClient from '@/lib/graphql-client';
import { searchShortTermProperties, getPropertiesByLocation } from '@/lib/graphql/queries';

// Short-term search
const data = await GraphQLClient.executePublic<{ searchShortTermProperties: any }>(
  searchShortTermProperties,
  { input: { region, district, checkInDate, checkOutDate } }
);

// Long-term search
const data = await GraphQLClient.executePublic<{ getPropertiesByLocation: any }>(
  getPropertiesByLocation,
  { region, district, moveInDate }
);
```

### Authenticated Queries
```typescript
import GraphQLClient from '@/lib/graphql-client';
import { getMe } from '@/lib/graphql/queries';

const data = await GraphQLClient.executeAuthenticated<{ getMe: UserProfile }>(
  getMe
);

const user = data.getMe;
```

### Mutations
```typescript
import GraphQLClient from '@/lib/graphql-client';
import { toggleFavorite } from '@/lib/graphql/mutations';

const data = await GraphQLClient.executeAuthenticated<{ toggleFavorite: any }>(
  toggleFavorite,
  { propertyId: 'property-123' }
);
```

## Error Resolution

### Fixed: Homepage data now from CloudFront
**Issue**: Homepage was using GraphQL queries which were slower and not matching the web app architecture.

**Solution**: Created `lib/homepage-cache.ts` to fetch pre-generated property data from CloudFront CDN, matching the web app's approach for fast homepage loading.

### Fixed: "Unknown field: getCategorizedProperties"
**Issue**: The query name didn't match the backend schema.

**Solution**: Used the correct auto-generated query from `lib/graphql/queries.ts` which matches the backend schema exactly.

### Fixed: Case-sensitivity issue (API.ts vs api.ts)
**Issue**: TypeScript was confused by case-insensitive file system treating `API.ts` and `api.ts` as the same file.

**Solution**: 
1. Removed the redundant `api-client.ts` file
2. Added `forceConsistentCasingInFileNames: true` to tsconfig.json

## Environment Variables

Add to your `.env` file:

```env
# CloudFront CDN for homepage cache
EXPO_PUBLIC_CLOUDFRONT_DOMAIN=https://d2bstvyam1bm1f.cloudfront.net
EXPO_PUBLIC_STAGE=dev

# GraphQL API (for search and other queries)
EXPO_PUBLIC_GRAPHQL_ENDPOINT=https://pkqm7izcm5gm5hall3gc6o5dx4.appsync-api.us-west-2.amazonaws.com/graphql
EXPO_PUBLIC_GRAPHQL_REGION=us-west-2
EXPO_PUBLIC_API_KEY=da2-4kqoqw7d2jbndbilqiqpkypsve
```

## CloudFront Cache Structure

### Long-Term Properties
URL: `https://d2bstvyam1bm1f.cloudfront.net/homepage/dev/long-term-properties.json`

```json
{
  "lowestPrice": [...],
  "nearby": [...],
  "mostViewed": [...],
  "recentlyViewed": [...],
  "favorites": [...],
  "more": [...],
  "generatedAt": "2024-02-18T10:30:00Z"
}
```

### Short-Term Properties
URL: `https://d2bstvyam1bm1f.cloudfront.net/homepage/dev/short-term-properties.json`

```json
{
  "lowestPrice": [...],
  "highestPrice": [...],
  "topRated": [...],
  "featured": [...],
  "recent": [...],
  "generatedAt": "2024-02-18T10:30:00Z"
}
```

## Schema Generation

To regenerate queries when the schema changes:

```bash
cd ndotoniApp
pnpm run schema:update
```

This will:
1. Download the latest schema from AppSync
2. Clean scalar definitions
3. Generate TypeScript types and queries

## Files Modified
- ✅ `app/(tabs)/index.tsx` - Updated to use GraphQL client directly
- ✅ `app/search.tsx` - Updated to use GraphQL client directly
- ✅ `tsconfig.json` - Added case-sensitivity enforcement
- ❌ `lib/api-client.ts` - Deleted (no longer needed)

## Next Steps

When adding new features:
1. Check `lib/graphql/queries.ts` for available queries
2. Use `GraphQLClient.executePublic()` for public queries
3. Use `GraphQLClient.executeAuthenticated()` for authenticated queries
4. Import the query from `@/lib/graphql/queries` or `@/lib/graphql/mutations`
5. No need to write custom query strings!
