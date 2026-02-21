# Google Sign-In Fix - Complete Manual OAuth Implementation

## Problems Encountered

### Problem 1: createSigninRequest Error
```
TypeError: userManager.createSigninRequest is not a function (it is undefined)
```

### Problem 2: Bad Request Error
OAuth URL was using wrong endpoint (IDP instead of Hosted UI)

### Problem 3: State Storage Format Mismatch
```
SyntaxError: JSON Parse error: Unexpected character: o
```

### Problem 4: User Storage Incompatibility
```
TypeError: user.toStorageString is not a function (it is undefined)
```
The `oidc-client-ts` UserManager expected specific internal methods and storage formats.

## Root Cause
The `oidc-client-ts` library is designed for web browsers and doesn't work properly in React Native. It has internal dependencies on browser APIs and specific storage formats that don't translate well to mobile.

## Solution
Implemented a complete custom OAuth flow bypassing `oidc-client-ts` internals:

1. **Manual URL Construction**: Build OAuth URLs using Cognito Hosted UI domain
2. **Custom State Management**: Generate and store state parameters using AsyncStorage
3. **Manual Token Exchange**: Exchange authorization code for tokens via direct API call
4. **JWT Decoding**: Decode ID token to extract user profile
5. **Simple Storage**: Store user object directly in AsyncStorage with a simple key
6. **Custom Retrieval**: Implement our own getCurrentUser/isAuthenticated functions

## Changes Made

### `ndotoniApp/lib/auth/oidc-manager.ts`
- Added `generateState()` - Generate random state parameters
- Added `buildAuthUrl()` - Build OAuth URLs using `cognitoDomain`
- Added `exchangeCodeForTokens()` - Manual token exchange with Cognito
- Added `decodeJwt()` - Decode JWT tokens for user profile
- Rewrote `handleAuthCallback()` - Complete manual callback handling
- Rewrote `getCurrentUser()` - Direct AsyncStorage retrieval
- Rewrote `isAuthenticated()` - Check expiration manually
- Updated `signInWithGoogle()`, `signInWithFacebook()`, `signInWithRedirect()`
- Updated `signOutWithRedirect()` - Clear AsyncStorage directly

### `ndotoniApp/polyfills.ts`
- Added `atob`/`btoa` polyfills for JWT decoding using Buffer

## OAuth Flow
1. User taps "Sign in with Google"
2. App generates state parameter and stores it
3. Opens browser with Cognito Hosted UI + Google identity provider
4. User authenticates with Google
5. Cognito redirects to `exp://127.0.0.1:8081?code=...&state=...`
6. App receives callback URL
7. Verifies state parameter
8. Exchanges authorization code for tokens (POST to token endpoint)
9. Decodes ID token to get user profile
10. Stores user object in AsyncStorage with key `oidc.current_user`
11. `HybridAuthService.isAuthenticated()` returns true
12. GraphQL client can get access token and make authenticated requests

## Storage
- User data stored at: `oidc.current_user`
- State data stored at: `oidc.state.{state_value}`
- Simple JSON serialization, no special formats required

## Token Expiration
Tokens are checked for expiration by comparing current timestamp with `expires_at` from the ID token payload.

## Testing
1. Open app in Expo Go
2. Tap "Sign in with Google"
3. Browser opens with Cognito Hosted UI
4. Select Google account and authorize
5. Redirects back to app
6. Check logs for successful token exchange
7. User should be authenticated and able to make GraphQL requests
