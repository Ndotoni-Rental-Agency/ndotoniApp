# OAuth Session Issue - Root Cause & Solution

## The Core Problem

OAuth sign-in successfully obtains tokens from Cognito, but **Amplify doesn't establish a session** with those tokens. This causes all subsequent authenticated requests to fail with:

```
[UserUnAuthenticatedException: User needs to be authenticated to call this API.]
```

## Why This Happens

AWS Amplify in React Native expects OAuth to work through its built-in `signInWithRedirect` flow, which:
1. Opens the OAuth URL
2. Handles the redirect callback
3. Exchanges the authorization code for tokens
4. **Stores tokens in Amplify's secure storage**
5. Establishes a session

The current manual OAuth implementation:
1. ✅ Opens the OAuth URL
2. ✅ Gets tokens from redirect
3. ✅ Fetches user profile
4. ❌ **Never tells Amplify about the tokens**
5. ❌ **No Amplify session established**

## The Real Solution

You need to use **password authentication** for now, which works correctly. OAuth in React Native with Amplify requires additional setup that's beyond a quick fix.

### For Users

**Use email/password sign-in instead of Google/Facebook OAuth until this is fixed.**

The password flow works because:
- Amplify's `signIn()` properly establishes a session
- Tokens are stored in Amplify's secure storage
- All authenticated requests work correctly

### For Developers - Proper OAuth Fix

To make OAuth work properly, you need to implement one of these approaches:

#### Option 1: Use Amplify's signInWithRedirect (Recommended but Complex)

This requires:
1. Proper deep linking configuration in `app.json`
2. Handling the OAuth callback in your app
3. Testing extensively on both iOS and Android

```typescript
// In auth-bridge.ts
static async signInWithGoogle() {
  const { signInWithRedirect } = await import('aws-amplify/auth');
  await signInWithRedirect({ provider: 'Google' });
}

// In app/_layout.tsx - handle the callback
import { Hub } from 'aws-amplify/utils';

useEffect(() => {
  const unsubscribe = Hub.listen('auth', ({ payload }) => {
    if (payload.event === 'signInWithRedirect') {
      // OAuth completed, refresh auth state
      refreshAuthState();
    }
  });
  return unsubscribe;
}, []);
```

#### Option 2: Manual Token Storage (Hacky but Works)

After getting OAuth tokens, manually store them in Amplify's storage:

```typescript
// This is undocumented and may break in future Amplify versions
import { Amplify } from 'aws-amplify';
import { defaultStorage } from 'aws-amplify/utils';

// After getting tokens from OAuth
await defaultStorage.setItem('CognitoIdentityServiceProvider.{clientId}.{username}.idToken', idToken);
await defaultStorage.setItem('CognitoIdentityServiceProvider.{clientId}.{username}.accessToken', accessToken);
await defaultStorage.setItem('CognitoIdentityServiceProvider.{clientId}.{username}.refreshToken', refreshToken);
await defaultStorage.setItem('CognitoIdentityServiceProvider.{clientId}.LastAuthUser', username);
```

This is fragile and not recommended.

#### Option 3: Token-Based Auth (Clean but Requires Changes)

Stop using Amplify's session management for OAuth users. Instead:

1. Store tokens in AsyncStorage
2. Pass tokens directly to all GraphQL requests
3. Handle token refresh manually

```typescript
// Global token storage
let oauthTokens: { idToken: string; accessToken: string } | null = null;

// After OAuth success
oauthTokens = { idToken, accessToken };

// In GraphQLClient
static async executeAuthenticated(query, variables) {
  if (oauthTokens) {
    // Use OAuth tokens directly
    return this.executeWithToken(query, variables, oauthTokens.idToken);
  } else {
    // Use Amplify session (password auth)
    return this.executeWithAmplify(query, variables);
  }
}
```

## Current Status

- ✅ Password authentication works perfectly
- ❌ OAuth authentication gets tokens but doesn't establish session
- ⚠️ OAuth users can sign in but can't make authenticated requests

## Immediate Workaround

Until OAuth is properly fixed:

1. **Disable OAuth buttons** in the UI, or
2. **Show a message** that OAuth is temporarily unavailable, or
3. **Redirect OAuth users** to complete their profile with password setup

## Testing After Fix

When implementing a fix, test:

1. Sign in with Google
2. Close and reopen app
3. Make an authenticated GraphQL request
4. Verify it works without errors
5. Sign out
6. Verify session is cleared
7. Repeat with Facebook

## Why This Is Hard

React Native + Amplify + OAuth is complex because:
- Deep linking must be configured correctly
- OAuth callbacks need special handling
- Amplify's storage mechanisms are platform-specific
- Token management is internal to Amplify
- Documentation is sparse for React Native

## Recommendation

**Stick with password authentication** for your React Native app. It's simpler, more reliable, and works perfectly. OAuth is better suited for web applications where redirect flows are native to the platform.

If you absolutely need OAuth:
- Consider using a web view for OAuth (like many apps do)
- Or implement Option 3 (token-based auth) for a clean separation
- Or invest time in properly implementing Option 1 with deep linking

## Files Involved

- `ndotoniApp/lib/auth-bridge.ts` - OAuth implementation
- `ndotoniApp/contexts/AuthContext.tsx` - Auth state management
- `ndotoniApp/lib/graphql-client.ts` - GraphQL requests
- `ndotoniApp/lib/config.ts` - Amplify configuration
- `ndotoniApp/app/_layout.tsx` - App initialization

## Related Issues

- OAuth tokens stored in AsyncStorage but not in Amplify storage
- `getCurrentUser()` fails because Amplify has no session
- User profile fetched successfully but session not persisted
- Works on first request (using stored token) but fails on subsequent requests
