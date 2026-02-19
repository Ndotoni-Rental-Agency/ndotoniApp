# Fix Authentication "Unknown Error"

## Problem
Getting "Unknown: An unknown error has occurred" when trying to sign in with Cognito.

## Root Cause
AWS Amplify requires crypto polyfills for React Native, which are missing.

## Solution

### 1. Install Required Packages

Run this command in the `ndotoniApp` directory:

```bash
npm install react-native-get-random-values react-native-url-polyfill text-encoding
```

Or with pnpm:

```bash
pnpm add react-native-get-random-values react-native-url-polyfill text-encoding
```

### 2. Restart the Development Server

After installing, restart your Expo development server:

```bash
# Stop the current server (Ctrl+C)
# Then start again
npm start
```

### 3. Clear Cache (if needed)

If the error persists, clear the cache:

```bash
npm start -- --clear
```

## What Was Done

1. **Created `polyfills.ts`** - Sets up required polyfills for:
   - `crypto.getRandomValues` (for secure random number generation)
   - `TextEncoder/TextDecoder` (for text encoding)
   - URL polyfills (for URL parsing)

2. **Updated `app/_layout.tsx`** - Imports polyfills before any other code

3. **Added logging** - Detailed error logging throughout auth flow

## Packages Installed

- **react-native-get-random-values** - Provides `crypto.getRandomValues()` for React Native
- **react-native-url-polyfill** - URL API polyfill for React Native
- **text-encoding** - TextEncoder/TextDecoder polyfill

## Testing

After installing and restarting:

1. Try signing in again
2. Check the console for detailed logs:
   - `[Polyfills] Loaded successfully` - Confirms polyfills loaded
   - `[AuthBridge] Starting Cognito sign in` - Shows auth flow starting
   - Any errors will now show detailed information

## Why This Happens

AWS Amplify's Cognito SDK uses Web Crypto API which isn't available in React Native by default. The polyfills provide these missing APIs.

## Alternative: Use Expo's Crypto

If you prefer Expo's built-in crypto (Expo SDK 48+):

```typescript
// In polyfills.ts, replace react-native-get-random-values with:
import * as Crypto from 'expo-crypto';

if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (array: any) => {
      return Crypto.getRandomBytes(array.length);
    }
  } as any;
}
```

But `react-native-get-random-values` is the recommended approach for Amplify.
