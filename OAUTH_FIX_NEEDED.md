# OAuth Authentication Fix Needed

## Current Issue

Google/Facebook OAuth sign-in successfully obtains tokens but doesn't establish an Amplify session. This causes subsequent authenticated requests to fail with:
```
[UserUnAuthenticatedException: User needs to be authenticated to call this API.]
```

## Root Cause

The current implementation:
1. Opens OAuth flow manually via `expo-web-browser`
2. Gets tokens from the redirect URL
3. Stores tokens in AsyncStorage
4. Fetches user profile successfully

BUT: Amplify doesn't know about these tokens, so when other parts of the app call `getCurrentUser()` or `fetchAuthSession()`, there's no session.

## Solution Options

### Option 1: Use Amplify's Built-in OAuth (Recommended)

Change the Amplify configuration to use `response_type: 'code'` and let Amplify handle the entire OAuth flow:

```typescript
// In ndotoniApp/lib/config.ts
responseType: 'code' // Instead of 'token'
```

Then use Amplify's `signInWithRedirect`:

```typescript
import { signInWithRedirect } from 'aws-amplify/auth';

await signInWithRedirect({ provider: 'Google' });
```

**Pros:**
- Amplify handles everything
- Session is properly established
- Tokens are managed automatically

**Cons:**
- Requires testing to ensure it works with Expo
- May need additional Expo configuration

### Option 2: Manually Establish Amplify Session (Complex)

After getting tokens from OAuth, manually create an Amplify session by:

1. Storing tokens in Amplify's storage
2. Calling internal Amplify methods to establish session

This is complex and uses internal APIs that may change.

### Option 3: Use Token-Based Auth Everywhere (Current Workaround)

Update all GraphQL calls to accept and use the ID token directly instead of relying on Amplify's session:

```typescript
// Store tokens globally
let currentIdToken: string | null = null;

// After OAuth success
currentIdToken = idToken;

// In GraphQLClient
static async executeAuthenticated(query, variables, token = currentIdToken) {
  // Use token directly in Authorization header
}
```

**Pros:**
- Works immediately
- No Amplify session needed

**Cons:**
- Need to update all authenticated calls
- Manual token refresh handling
- More code changes

## Recommended Fix (Option 1 Implementation)

1. Update `ndotoniApp/lib/config.ts`:
```typescript
responseType: 'code' // Change from 'token'
```

2. Update `ndotoniApp/lib/auth-bridge.ts`:
```typescript
static async signInWithGoogle() {
  const { signInWithRedirect } = await import('aws-amplify/auth');
  
  await signInWithRedirect({ 
    provider: 'Google',
    options: {
      preferPrivateSession: false // For Expo compatibility
    }
  });
}
```

3. Handle the OAuth callback in `app/_layout.tsx`:
```typescript
import { Hub } from 'aws-amplify/utils';

useEffect(() => {
  const unsubscribe = Hub.listen('auth', ({ payload }) => {
    if (payload.event === 'signInWithRedirect') {
      console.log('OAuth sign in successful');
      // Refresh auth state
    }
  });
  
  return unsubscribe;
}, []);
```

4. Test thoroughly with both Google and Facebook

## Testing Checklist

After implementing the fix:

- [ ] Google OAuth sign in works
- [ ] Facebook OAuth sign in works
- [ ] Session persists after app restart
- [ ] Authenticated GraphQL queries work
- [ ] Token refresh works automatically
- [ ] Sign out clears session properly

## Current Workaround

Until this is fixed, users experiencing OAuth issues should:
1. Use email/password sign in instead
2. Or restart the app after OAuth sign in (session should be established on restart)

## References

- [Amplify OAuth Documentation](https://docs.amplify.aws/react-native/build-a-backend/auth/add-social-provider/)
- [Expo Web Browser](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
- [AWS Cognito OAuth Flows](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html)
