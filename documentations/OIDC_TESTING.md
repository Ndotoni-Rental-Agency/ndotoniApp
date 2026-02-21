# OIDC Authentication Testing Guide

## Quick Test Commands

### 1. Start the App
```bash
cd ndotoniApp
npx expo start
```

### 2. Test Authentication Flows

#### Email/Password Sign In
1. Open the app
2. Navigate to sign in screen
3. Enter test credentials
4. Verify successful sign in
5. Check console for token logs

#### Email/Password Sign Up
1. Navigate to sign up screen
2. Fill in all required fields
3. Submit form
4. Verify email verification prompt
5. Check email for verification code

#### Google OAuth
1. Click "Sign in with Google"
2. Should redirect to Cognito hosted UI
3. Select Google account
4. Verify redirect back to app
5. Check that user is authenticated

#### Facebook OAuth
1. Click "Sign in with Facebook"
2. Should redirect to Cognito hosted UI
3. Authorize with Facebook
4. Verify redirect back to app
5. Check that user is authenticated

### 3. Verify Token Access

Add this to any component to test token access:

```typescript
import { useAuth } from '@/contexts/AuthContext';

function TestComponent() {
  const auth = useAuth();
  
  console.log('Auth State:', {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    hasUser: !!auth.user,
    hasIdToken: !!auth.idToken,
    hasAccessToken: !!auth.accessToken,
    hasRefreshToken: !!auth.refreshToken,
  });
  
  // Test direct token access
  if (auth.idToken) {
    console.log('ID Token (first 50 chars):', auth.idToken.substring(0, 50));
  }
  
  return null;
}
```

### 4. Test GraphQL Queries

#### Authenticated Query
```typescript
import { GraphQLClient } from '@/lib/graphql-client';
import { useAuth } from '@/contexts/AuthContext';

const auth = useAuth();

// With OIDC token
const data = await GraphQLClient.executeAuthenticated(
  getMe,
  {},
  auth.idToken // Pass token directly
);

// Or let it use Amplify (fallback)
const data = await GraphQLClient.executeAuthenticated(
  getMe,
  {}
);
```

#### Public Query
```typescript
const data = await GraphQLClient.executePublic(
  listProperties,
  { limit: 10 }
);
```

### 5. Test Sign Out

```typescript
const auth = useAuth();

await auth.signOut();

// Verify:
// - auth.isAuthenticated === false
// - auth.user === null
// - All tokens are null
// - AsyncStorage is cleared
```

## Expected Console Logs

### Successful Sign In
```
[AuthContext] Authenticated request: { userId: "...", username: "...", hasAccessToken: true, hasIdToken: true }
[AuthContext] User profile fetched successfully
```

### Token Sync
```
Auth State: {
  isAuthenticated: true,
  isLoading: false,
  hasUser: true,
  hasIdToken: true,
  hasAccessToken: true,
  hasRefreshToken: true
}
```

### GraphQL Request with OIDC Token
```
[GraphQLClient] Using OIDC token for authenticated request
```

## Common Issues & Solutions

### Issue: "No valid authentication token"
**Solution:** User needs to sign in again. Check if tokens expired.

### Issue: OAuth redirect not working
**Solution:** 
1. Verify redirect URI in Cognito console matches app scheme
2. Check that `expo-web-browser` is properly configured
3. Ensure `WebBrowser.maybeCompleteAuthSession()` is called

### Issue: "User not confirmed"
**Solution:** User needs to verify email. Show verification modal.

### Issue: GraphQL returns 401
**Solution:**
1. Check that ID token is being passed correctly
2. Verify token hasn't expired
3. Check Cognito user pool configuration

## Performance Checks

### Token Refresh
- Tokens should auto-refresh when expired
- No user interaction required
- Check console for refresh logs

### Cache Behavior
- Authenticated queries should use cache
- Cache should be cleared on sign out
- Verify cache hit/miss rates

### Memory Usage
- Monitor for memory leaks
- Check that old tokens are garbage collected
- Verify AsyncStorage doesn't grow unbounded

## Rollback Procedure

If critical issues found:

1. Stop the app
2. Restore backup:
   ```bash
   cp ndotoniApp/contexts/AuthContext.amplify.backup.tsx ndotoniApp/contexts/AuthContext.tsx
   ```
3. Restart app
4. Document the issue
5. Fix and retry migration

## Success Criteria

✅ All auth flows work without errors
✅ Tokens are accessible via `auth.idToken`, etc.
✅ GraphQL queries work with OIDC tokens
✅ OAuth redirects work properly
✅ Sign out clears all state
✅ No memory leaks
✅ Performance is same or better
✅ Error messages are clear and helpful

## Next Steps After Testing

1. Monitor production logs for auth errors
2. Set up error tracking for auth failures
3. Document any edge cases discovered
4. Update user-facing documentation
5. Train team on new auth flow
6. Plan removal of Amplify dependency
