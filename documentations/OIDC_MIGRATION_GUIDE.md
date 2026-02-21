# OIDC Authentication Migration Guide

## Overview

The ndotoniApp has been migrated from AWS Amplify authentication to a standard OIDC (OpenID Connect) approach using `react-oidc-context`. This provides a cleaner, more standard authentication implementation.

## What Changed

### Dependencies Added
- `oidc-client-ts` - Standard OIDC client library
- `react-oidc-context` - React context wrapper for OIDC

### Dependencies Kept (for now)
- `aws-amplify` - Still used for password authentication flow
- Can be removed once backend supports direct token endpoint

### Files Modified

1. **ndotoniApp/contexts/AuthContext.tsx** (replaced)
   - Now uses `react-oidc-context` as the base
   - Wraps OIDC provider with custom auth logic
   - Maintains same API for backward compatibility

2. **ndotoniApp/lib/graphql-client.ts** (updated)
   - Added support for direct ID token passing
   - Supports both Amplify (legacy) and OIDC modes

3. **ndotoniApp/contexts/AuthContext.amplify.backup.tsx** (backup)
   - Original Amplify-based implementation preserved

## Key Improvements

### 1. Direct Token Access
```typescript
const auth = useAuth();
console.log(auth.idToken);        // Direct access
console.log(auth.accessToken);    // Direct access
console.log(auth.refreshToken);   // Direct access
```

### 2. Standard OIDC Configuration
```typescript
const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_0DZJBusjf",
  client_id: "4k6u174tgu4glhi814ulihckh4",
  redirect_uri: "ndotoniapp://",
  response_type: "code",
  scope: "email openid profile",
};
```

### 3. Simpler OAuth Flows
```typescript
// Google Sign In
await auth.signInWithSocial('google');

// Uses OIDC redirect with identity provider hint
await oidcAuth.signinRedirect({
  extraQueryParams: {
    identity_provider: 'Google',
    prompt: 'select_account',
  },
});
```

## Migration Steps Completed

✅ Installed `oidc-client-ts` and `react-oidc-context`
✅ Created new OIDC-based AuthContext
✅ Updated GraphQL client to support direct token passing
✅ Maintained backward compatibility with existing auth API
✅ Backed up original Amplify implementation

## Testing Checklist

Before deploying, test these flows:

- [ ] Email/password sign in
- [ ] Email/password sign up
- [ ] Email verification
- [ ] Password reset
- [ ] Google OAuth sign in
- [ ] Facebook OAuth sign in
- [ ] Sign out
- [ ] Token refresh
- [ ] Authenticated GraphQL queries
- [ ] Public GraphQL queries

## Known Limitations

### Password Authentication
Currently still uses Amplify's `signIn` for password authentication because:
- Cognito doesn't support password grant in OAuth2 endpoint
- Requires USER_PASSWORD_AUTH flow which Amplify handles well

### Future Improvements
1. Create backend endpoint that accepts email/password and returns OIDC tokens
2. Remove Amplify dependency completely
3. Use pure OIDC for all auth flows

## Rollback Plan

If issues arise, rollback is simple:

1. Restore original AuthContext:
   ```bash
   cp ndotoniApp/contexts/AuthContext.amplify.backup.tsx ndotoniApp/contexts/AuthContext.tsx
   ```

2. Revert GraphQL client changes (remove idToken parameter)

3. Uninstall OIDC packages:
   ```bash
   npm uninstall oidc-client-ts react-oidc-context
   ```

## Environment Variables

No changes to environment variables required. The same Cognito configuration is used:

- `EXPO_PUBLIC_USER_POOL_ID`
- `EXPO_PUBLIC_USER_POOL_CLIENT_ID`
- `EXPO_PUBLIC_COGNITO_DOMAIN`
- `EXPO_PUBLIC_REDIRECT_SIGN_IN`
- `EXPO_PUBLIC_REDIRECT_SIGN_OUT`
- `EXPO_PUBLIC_GRAPHQL_ENDPOINT`
- `EXPO_PUBLIC_GRAPHQL_REGION`
- `EXPO_PUBLIC_API_KEY`

## API Compatibility

The public API remains unchanged. All existing code using `useAuth()` will continue to work:

```typescript
const auth = useAuth();

// All these still work
auth.signIn(email, password);
auth.signUp(input);
auth.signOut();
auth.user;
auth.isAuthenticated;
auth.isLoading;
// etc.
```

## Next Steps

1. Test all authentication flows thoroughly
2. Monitor for any auth-related errors
3. Consider creating backend token endpoint to remove Amplify dependency
4. Update documentation for other developers
5. Remove Amplify packages once fully migrated

## Support

If you encounter issues:
1. Check console logs for detailed error messages
2. Verify Cognito configuration in AWS Console
3. Test with the backup Amplify implementation
4. Review this migration guide

## References

- [react-oidc-context Documentation](https://github.com/authts/react-oidc-context)
- [oidc-client-ts Documentation](https://github.com/authts/oidc-client-ts)
- [AWS Cognito OIDC Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html)
