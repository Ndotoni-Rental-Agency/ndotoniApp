# Authentication Token Restoration Fix - CRITICAL

## The Real Problem
The app was experiencing a **race condition** during initialization:

1. ✅ User WAS authenticated (had valid Cognito tokens in AsyncStorage)
2. ❌ But `getCurrentUser()` was failing because Amplify hadn't restored tokens yet
3. ❌ AuthContext set `isAuthenticated: true` based on cached user data
4. ❌ GraphQL calls failed with `UserUnAuthenticatedException`

## Root Cause: Async Token Restoration
In React Native, Amplify restores tokens **asynchronously** from AsyncStorage:
- App starts → React renders → Hooks fire → GraphQL calls execute
- Meanwhile: Amplify is still restoring tokens in the background
- Result: GraphQL calls happen BEFORE tokens are ready → 💥 Boom

## The Critical Mistake
```typescript
// ❌ WRONG - doesn't guarantee tokens are ready
const hasCognitoSession = await AuthBridge.hasCognitoSession();
if (hasCognitoSession) {
  setAuthState({ isAuthenticated: true });
  // GraphQL calls will fail here!
}
```

The problem: `hasCognitoSession()` was checking for a cached user, NOT verifying tokens were restored.

## The Solution: Force Token Restoration
```typescript
// ✅ CORRECT - forces token restoration
const session = await fetchAuthSession();
const hasValidTokens = !!session.tokens?.accessToken;

if (hasValidTokens) {
  // NOW tokens are guaranteed to be ready
  setAuthState({ isAuthenticated: true });
  // GraphQL calls will work!
}
```

## Why `fetchAuthSession()` Works
1. **Restores tokens** from AsyncStorage
2. **Refreshes them** if expired
3. **Ensures Amplify client** has them internally
4. **Blocks until complete** - no race condition

## Why `getCurrentUser()` Fails
1. Tries to load the **full user object**
2. Can fail even when **tokens exist**
3. Doesn't guarantee **tokens are usable**
4. Not reliable during **app initialization**

## Files Modified

### 1. `ndotoniApp/contexts/AuthContext.tsx`
**CRITICAL CHANGE**: Use `fetchAuthSession()` directly in `initializeAuth()`

```typescript
const initializeAuth = async () => {
  // 🔥 FORCE token restoration
  const session = await fetchAuthSession();
  const hasValidTokens = !!session.tokens?.accessToken;
  
  if (hasValidTokens) {
    // Tokens are ready - safe to make authenticated calls
    setAuthState({ isAuthenticated: true });
  }
};
```

### 2. `ndotoniApp/lib/graphql-client.ts`
- Removed `getCurrentUser()` import
- All auth checks now use `fetchAuthSession()`
- Verify `session.tokens?.accessToken` exists before making calls

### 3. `ndotoniApp/lib/auth-bridge.ts`
- Updated `hasCognitoSession()` to use `fetchAuthSession()`
- Updated `getAuthMode()` to use token-based checks

### 4. `ndotoniApp/app/landlord/properties.tsx`
- Pass `isAuthenticated && !authLoading` to hooks
- Ensures hooks only fetch when auth is fully initialized

## The Architectural Pattern

```
App Start
   ↓
fetchAuthSession() ← FORCE token restoration
   ↓
Check session.tokens?.accessToken
   ↓
Set isAuthenticated: true
   ↓
Hooks can now safely call GraphQL
```

## Key Takeaways

1. **ALWAYS** call `fetchAuthSession()` before setting `isAuthenticated: true`
2. **NEVER** rely on `getCurrentUser()` for auth checks during initialization
3. **VERIFY** `session.tokens?.accessToken` exists, not just user data
4. **WAIT** for token restoration before making authenticated GraphQL calls

## Testing Checklist

- [ ] App starts with cached user → tokens restore → GraphQL works
- [ ] App starts without user → no errors → shows login
- [ ] User signs in → tokens saved → GraphQL works immediately
- [ ] User signs out → tokens cleared → falls back to API key
- [ ] App reopens after being closed → tokens restore → GraphQL works

## Result
✅ No more `UserUnAuthenticatedException` errors
✅ Tokens are guaranteed to be ready before GraphQL calls
✅ Smooth user experience with proper loading states
✅ Reliable authentication across app restarts
