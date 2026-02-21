# Authentication Persistence in ndotoniApp

## Overview
Authentication is fully persisted in the mobile app. Users remain logged in until they explicitly sign out.

## How It Works

### 1. Cognito Session Management
- **AWS Amplify v6** automatically manages Cognito sessions with secure storage
- Tokens (access, refresh, ID) are stored securely by Amplify in the device's secure storage
- Sessions are automatically refreshed when tokens expire
- No manual token management required

### 2. User Profile Caching
- User profile data is stored in **AsyncStorage** (`@ndotoni:user` key)
- Cached on successful sign-in/sign-up
- Retrieved on app launch to provide instant user data
- Synced with backend when needed

### 3. Initialization Flow
```typescript
// On app launch (AuthContext.tsx)
1. Check if Cognito session exists (AuthBridge.hasCognitoSession())
2. If session exists:
   a. Load user profile from AsyncStorage (instant)
   b. Optionally refresh from backend if needed
3. If no session:
   a. User is logged out
   b. Clear AsyncStorage
```

### 4. Sign In Flow
```typescript
1. User enters credentials
2. Authenticate with Cognito (AuthBridge.signInWithAmplify)
3. Fetch user profile from backend (getMe query)
4. Store user profile in AsyncStorage
5. Update AuthContext state
```

### 5. Sign Out Flow
```typescript
1. Sign out from Cognito (clears secure tokens)
2. Clear AsyncStorage (@ndotoni:user)
3. Reset AuthContext state
```

## Storage Locations

### Secure Storage (Managed by Amplify)
- Access Token
- Refresh Token
- ID Token
- Cognito session data

### AsyncStorage (Manual)
- User profile data (`@ndotoni:user`)
- OAuth tokens for social sign-in (`@ndotoni:oauth_id_token`, `@ndotoni:oauth_access_token`)

## Key Files

### AuthContext (`contexts/AuthContext.tsx`)
- Main authentication state management
- Handles sign-in, sign-up, sign-out
- Manages user profile caching
- Provides authentication hooks

### AuthBridge (`lib/auth-bridge.ts`)
- Bridge between Amplify and custom backend
- Handles Cognito operations
- Manages OAuth flows (Google, Facebook)
- Token management

### Amplify Config (`lib/amplify.ts`)
- Configures AWS Amplify
- Sets up Cognito User Pool
- Configures AppSync GraphQL endpoint

## Authentication Persistence Features

✅ **Automatic Session Refresh**
- Amplify automatically refreshes expired tokens
- No user intervention required

✅ **Secure Token Storage**
- Tokens stored in device secure storage
- Not accessible to other apps

✅ **Fast App Launch**
- User profile loaded from AsyncStorage instantly
- No network request needed on launch

✅ **Offline Support**
- User data available even without network
- Authentication state persists offline

✅ **Cross-Session Persistence**
- User stays logged in across app restarts
- Only logs out on explicit sign-out

## Testing Persistence

### Test Scenarios
1. **Sign in and close app** → User should still be logged in on reopen
2. **Sign in and force quit app** → User should still be logged in
3. **Sign in and wait 24 hours** → Session should auto-refresh
4. **Sign out** → User should be logged out permanently
5. **Uninstall and reinstall** → User should be logged out (storage cleared)

### Debugging
```typescript
// Check if user has Cognito session
const hasSession = await AuthBridge.hasCognitoSession();

// Check AsyncStorage
const storedUser = await AsyncStorage.getItem('@ndotoni:user');

// Get current Cognito user
const cognitoUser = await AuthBridge.getCurrentCognitoUser();
```

## Security Considerations

### ✅ Secure
- Tokens stored in device secure storage (Keychain on iOS, Keystore on Android)
- User profile data in AsyncStorage (not sensitive)
- Automatic token refresh prevents stale sessions

### ⚠️ Important
- User profile in AsyncStorage is NOT encrypted
- Don't store sensitive data (passwords, payment info) in user profile
- Always validate tokens on backend

## Configuration

### Environment Variables
```bash
EXPO_PUBLIC_USER_POOL_ID=us-west-2_xxxxx
EXPO_PUBLIC_USER_POOL_CLIENT_ID=xxxxx
EXPO_PUBLIC_COGNITO_DOMAIN=xxxxx.auth.us-west-2.amazoncognito.com
EXPO_PUBLIC_REDIRECT_SIGN_IN=ndotoniapp://
EXPO_PUBLIC_REDIRECT_SIGN_OUT=ndotoniapp://
```

### Amplify Configuration
- Uses Amplify v6 (latest)
- Configured in `lib/amplify.ts`
- Initialized in `app/_layout.tsx`

## Troubleshooting

### User Not Staying Logged In
1. Check if Amplify is properly initialized
2. Verify Cognito configuration
3. Check AsyncStorage permissions
4. Look for sign-out calls in code

### Session Expired Errors
1. Check token refresh logic
2. Verify Cognito token expiration settings
3. Check network connectivity
4. Review backend token validation

### OAuth Issues
1. Verify redirect URIs in Cognito
2. Check OAuth token storage
3. Review WebBrowser session handling
4. Test with different providers

## Summary

Authentication persistence is **fully implemented and working**. Users will:
- ✅ Stay logged in across app restarts
- ✅ Have instant access to their profile data
- ✅ Get automatic token refresh
- ✅ Only log out when they explicitly sign out

No additional changes needed - the system is production-ready!
