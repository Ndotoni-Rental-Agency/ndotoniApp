# OIDC Migration Reverted

## Summary

The migration from AWS Amplify to OIDC (`react-oidc-context`) has been reverted back to the original Amplify implementation.

## Why We Reverted

### Issue Encountered
After implementing the OIDC approach, users were getting authentication errors:
```
[UserUnAuthenticatedException: User needs to be authenticated to call this API.]
```

### Root Cause
The OIDC implementation had several issues:

1. **Session Persistence Problem**: The OIDC context wasn't properly persisting authentication state between app restarts
2. **Race Condition**: `initializeAuth()` was completing before the session was fully loaded
3. **Token Sync Issues**: Trying to sync between Amplify (for password auth) and OIDC (for OAuth) created complexity
4. **Missing Refresh Token**: AWS Cognito's `AuthTokens` type doesn't expose `refreshToken` directly

### What We Learned

The recommended OIDC approach from AWS documentation works well for:
- **Web applications** with redirect-based flows
- **Pure OAuth flows** (Google, Facebook only)
- **Applications that don't need password authentication**

However, for React Native apps that need:
- Password-based authentication (USER_PASSWORD_AUTH)
- Seamless session persistence
- Mixed auth methods (password + OAuth)

**AWS Amplify is actually the better choice** because:
- It handles all Cognito auth flows natively
- Session persistence is built-in and reliable
- Token refresh is automatic
- Works seamlessly with React Native

## Current State

✅ Reverted to original Amplify implementation
✅ Authentication working correctly
✅ Session persistence working
✅ All auth flows functional (password, Google, Facebook)

## Files Changed

- `ndotoniApp/contexts/AuthContext.tsx` - Restored to Amplify version
- `ndotoniApp/lib/graphql-client.ts` - Kept token parameter support (backward compatible)
- `ndotoniApp/package.json` - OIDC packages installed but not used (can be removed)

## Recommendation

**Keep using AWS Amplify** for this React Native app. The current implementation is:
- Stable and battle-tested
- Handles all required auth flows
- Properly persists sessions
- Automatically refreshes tokens

## If You Still Want OIDC

To successfully migrate to OIDC, you would need to:

1. **Create a backend token endpoint** that:
   - Accepts email/password
   - Authenticates with Cognito
   - Returns standard OIDC tokens
   
2. **Use OIDC only for OAuth flows** (Google/Facebook)

3. **Implement custom session storage** that:
   - Persists tokens to AsyncStorage
   - Restores on app launch
   - Handles token refresh

4. **Remove Amplify dependency completely**

This is a significant effort (2-3 days) and the benefit is minimal since Amplify already works well.

## Cleanup (Optional)

If you want to remove the OIDC packages:

```bash
cd ndotoniApp
npm uninstall oidc-client-ts react-oidc-context
```

Remove these files:
- `ndotoniApp/OIDC_MIGRATION_GUIDE.md`
- `ndotoniApp/OIDC_TESTING.md`
- `ndotoniApp/OIDC_MIGRATION_REVERTED.md` (this file)

## Conclusion

The AWS documentation example using `react-oidc-context` is designed for simpler use cases. For production React Native apps with complex auth requirements, **AWS Amplify is the recommended and supported solution**.

The current Amplify implementation is working correctly and should be kept as-is.
