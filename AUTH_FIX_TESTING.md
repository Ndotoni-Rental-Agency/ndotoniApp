# Authentication Fix - Testing Guide

## What Was Fixed
Fixed the `UserUnAuthenticatedException` error that occurred when the app tried to make authenticated GraphQL calls before Amplify had finished restoring tokens from AsyncStorage.

## The Fix
Changed from using `getCurrentUser()` to `fetchAuthSession()` for all authentication checks. This ensures tokens are fully restored before setting `isAuthenticated: true`.

## How to Test

### Test 1: Fresh App Start (User Previously Logged In)
1. **Setup**: Have a user logged in, then completely close the app
2. **Action**: Reopen the app
3. **Expected Logs**:
   ```
   [AuthContext] 🚀 Initializing auth...
   [AuthContext] 📡 Calling fetchAuthSession to restore tokens...
   [AuthContext] 🔑 Token check: { hasAccessToken: true, ... }
   [AuthContext] ✅ Valid tokens found - user is authenticated
   [AuthContext] 👤 Restored user from storage: { email: ..., userId: ... }
   [AuthContext] ✅ Auth initialization complete
   ```
4. **Expected Behavior**: 
   - No `UserUnAuthenticatedException` errors
   - User sees their properties immediately
   - GraphQL calls succeed

### Test 2: Fresh App Start (No User Logged In)
1. **Setup**: Make sure no user is logged in
2. **Action**: Open the app
3. **Expected Logs**:
   ```
   [AuthContext] 🚀 Initializing auth...
   [AuthContext] 📡 Calling fetchAuthSession to restore tokens...
   [AuthContext] 🔑 Token check: { hasAccessToken: false, ... }
   [AuthContext] ❌ No valid tokens found - user is not authenticated
   [AuthContext] ✅ Auth initialization complete
   ```
4. **Expected Behavior**:
   - No errors
   - User sees login screen or public content
   - No authenticated GraphQL calls are made

### Test 3: User Signs In
1. **Setup**: Start with no user logged in
2. **Action**: Sign in with email/password
3. **Expected Logs**:
   ```
   [AuthContext] Sign in successful
   [AuthContext] Storing auth data...
   ```
4. **Expected Behavior**:
   - User is redirected to authenticated screens
   - Properties load successfully
   - No authentication errors

### Test 4: Navigate to Landlord Properties
1. **Setup**: User is logged in
2. **Action**: Navigate to landlord properties screen
3. **Expected Logs**:
   ```
   [useLandlordProperties] 🚀 Hook mounted, starting fetch...
   [useLandlordProperties] 🔄 Fetching long-term properties...
   [GraphQLClient] Authenticated request: { hasAccessToken: true, ... }
   [useLandlordProperties] ✅ Response received: { count: X, ... }
   ```
4. **Expected Behavior**:
   - Properties load successfully
   - No `UserUnAuthenticatedException` errors

### Test 5: App Restart After Being Backgrounded
1. **Setup**: User is logged in and using the app
2. **Action**: Background the app for a while, then bring it back
3. **Expected Behavior**:
   - User remains logged in
   - GraphQL calls continue to work
   - No re-authentication required

## What to Look For

### ✅ Success Indicators
- Logs show `hasAccessToken: true` before any authenticated GraphQL calls
- No `UserUnAuthenticatedException` errors in console
- Properties load immediately on app start
- Smooth user experience with no authentication prompts

### ❌ Failure Indicators
- `UserUnAuthenticatedException` errors
- Logs show `hasAccessToken: false` but user should be authenticated
- Properties fail to load
- User is unexpectedly logged out

## Debugging

If you still see authentication errors:

1. **Check the logs** - Look for the token check log:
   ```
   [AuthContext] 🔑 Token check: { hasAccessToken: ?, ... }
   ```

2. **Verify token restoration** - If `hasAccessToken: false` but user should be logged in:
   - Check if tokens are stored in AsyncStorage
   - Check if Amplify configuration is correct
   - Check if token refresh is working

3. **Check timing** - Make sure:
   - `fetchAuthSession()` completes BEFORE setting `isAuthenticated: true`
   - Hooks wait for `isAuthenticated && !authLoading` before fetching
   - GraphQL calls happen AFTER token restoration

## Common Issues

### Issue: Tokens exist but `hasAccessToken: false`
**Cause**: Amplify configuration issue or token format problem
**Fix**: Check `ndotoniApp/lib/amplify.ts` configuration

### Issue: User logged out unexpectedly
**Cause**: Token refresh failed or tokens expired
**Fix**: Check token expiration settings in Cognito

### Issue: GraphQL calls still fail with auth error
**Cause**: Hooks firing before `isAuthenticated` is set
**Fix**: Verify hooks receive `isAuthenticated && !authLoading` parameter
