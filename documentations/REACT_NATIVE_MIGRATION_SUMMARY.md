# React Native Migration Summary

This document summarizes the changes made to adapt hooks from ndotoniWeb (Next.js) to ndotoniApp (React Native/Expo).

## Files Created

### 1. Core Library Files

#### `lib/cache.ts`
- GraphQL caching layer for React Native
- Uses AsyncStorage instead of localStorage
- Includes `query`, `mutate`, `queryAuthenticated`, and `queryPublic` methods
- Simplified version optimized for mobile

#### `lib/property-cache.ts`
- Property data fetching from CloudFront CDN
- Simplified version without Next.js-specific features
- Handles data cleaning and normalization

#### `lib/feature-flags.ts`
- Feature flag management for React Native
- Uses `EXPO_PUBLIC_*` environment variables instead of `NEXT_PUBLIC_*`

### 2. Utility Files

#### `lib/utils/errorUtils.ts`
- Error message extraction and formatting
- Cognito/Amplify error handling
- User-friendly error messages

#### `lib/utils/phoneValidation.ts`
- Phone number validation without external dependencies
- Supports Tanzanian local and international formats
- E.164 normalization

## Key Changes from Web to React Native

### 1. Router
- **Web**: `import { useRouter } from 'next/navigation'`
- **React Native**: `import { useRouter } from 'expo-router'`

### 2. Search Params
- **Web**: `useSearchParams()` with `.get('param')` method
- **React Native**: `useLocalSearchParams()` returns object with string | string[] | undefined

### 3. Storage
- **Web**: `localStorage` (synchronous)
- **React Native**: `AsyncStorage` (asynchronous, requires await)

### 4. Navigation
- **Web**: `router.push('/path?param=value')`
- **React Native**: `router.push({ pathname: '/path', params: { param: 'value' } })`

### 5. Environment Variables
- **Web**: `process.env.NEXT_PUBLIC_*`
- **React Native**: `process.env.EXPO_PUBLIC_*`

### 6. Client Directives
- **Web**: `'use client'` directive needed
- **React Native**: No directive needed (removed)

### 7. Window References
- **Web**: `window.location.origin` available
- **React Native**: Use hardcoded URLs or environment variables

### 8. Import Paths
- **Web**: `@/graphql/queries`, `@/API`
- **React Native**: `@/lib/graphql/queries`, `@/lib/API`

## Hooks Updated

The following hooks were adapted for React Native:

1. `usePropertyDetail.tsx` - Property details with cache fallback
2. `useShortTermPropertyDetail.tsx` - Short-term property details with AsyncStorage
3. `usePropertyContact.ts` - Property contact with expo-router params
4. `useChat.ts` - Chat navigation with expo-router
5. `useAdmin.ts` - Admin operations with correct import paths
6. `useAuthModal.ts` - Authentication modal with phone validation
7. `useProperty.ts` - Property management with cache integration

## TypeScript Language Server Issues

If you see import errors for files that exist:

1. **Restart TypeScript Server** (Recommended)
   - Command Palette → "TypeScript: Restart TS Server"

2. **Close and reopen the file**

3. **Restart your IDE**

The files are valid and exist - the language server just needs to refresh its cache.

## Dependencies

### Already Installed
- `@react-native-async-storage/async-storage` - For persistent storage
- `expo-router` - For navigation

### Not Needed
- `react-phone-number-input` - Replaced with custom validation
- `next/navigation` - Replaced with expo-router

## Testing Checklist

- [ ] Authentication flows (sign in, sign up, verify email)
- [ ] Property listing and details
- [ ] Favorites management (AsyncStorage persistence)
- [ ] Search functionality
- [ ] Navigation between screens
- [ ] Cache invalidation
- [ ] Error handling

## Notes

- All async storage operations are fire-and-forget where appropriate
- Cache TTL is set to 5 minutes by default
- Phone validation supports Tanzanian formats (local and international)
- GraphQL fallback can be disabled via feature flags
