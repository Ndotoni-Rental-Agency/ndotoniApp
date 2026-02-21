# OIDC Authentication Setup for ndotoniApp

## Overview

The mobile app now uses a **hybrid authentication approach**:
- **Amplify Auth** for email/password authentication
- **OIDC (oidc-client-ts)** for social authentication (Google, Facebook)

This provides the best of both worlds:
- Simple email/password flows with Amplify
- Reliable OAuth flows with OIDC standard library
- Works in both Expo Go and EAS Build

## Installation

### 1. Install Dependencies

```bash
cd ndotoniApp
npm install oidc-client-ts --save
```

### 2. Configure Environment Variables

Create or update `.env`:

```env
# Cognito Configuration
EXPO_PUBLIC_USER_POOL_ID=us-west-2_XXXXXXX
EXPO_PUBLIC_MOBILE_CLIENT_ID=XXXXXXXXXXXX
EXPO_PUBLIC_COGNITO_DOMAIN=rental-app-dev-055929692194.auth.us-west-2.amazoncognito.com
EXPO_PUBLIC_REGION=us-west-2

# AppSync Configuration
EXPO_PUBLIC_GRAPHQL_ENDPOINT=https://xxxxx.appsync-api.us-west-2.amazonaws.com/graphql
EXPO_PUBLIC_API_KEY=da2-xxxxxxxxxxxxx
```

### 3. Configure Deep Linking

Update `app.json`:

```json
{
  "expo": {
    "scheme": "ndotoniapp",
    "ios": {
      "bundleIdentifier": "com.ndotoni.app",
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": ["ndotoniapp"]
          }
        ]
      }
    },
    "android": {
      "package": "com.ndotoni.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "ndotoniapp"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

## Architecture

### File Structure

```
ndotoniApp/
├── lib/
│   └── auth/
│       ├── oidc-config.ts          # OIDC configuration
│       ├── oidc-manager.ts         # OIDC user manager
│       └── hybrid-auth-service.ts  # Unified auth service
├── contexts/
│   └── AuthContext.tsx             # React context (update to use hybrid service)
└── app/
    └── auth/
        └── callback.tsx            # OAuth callback handler
```

### Authentication Flows

#### Email/Password (Amplify)
```
User enters email/password
    ↓
Amplify Auth.signIn()
    ↓
Cognito validates credentials
    ↓
Returns JWT tokens
    ↓
User authenticated
```

#### Social Auth (OIDC)
```
User taps "Sign in with Google"
    ↓
Opens browser with Cognito Hosted UI
    ↓
User authenticates with Google
    ↓
Google redirects to Cognito
    ↓
Cognito redirects to ndotoniapp://auth/callback
    ↓
App handles callback with oidc-client-ts
    ↓
Exchanges code for tokens
    ↓
User authenticated
```

## Usage

### Basic Authentication

```typescript
import HybridAuthService from '@/lib/auth/hybrid-auth-service';

// Sign up with email/password
await HybridAuthService.signUp(
  'user@example.com',
  'Password123!',
  'John',
  'Doe',
  '+255712345678'
);

// Confirm sign up
await HybridAuthService.confirmSignUp('user@example.com', '123456');

// Sign in with email/password
await HybridAuthService.signIn('user@example.com', 'Password123!');

// Sign in with Google
await HybridAuthService.signInWithGoogle();

// Sign in with Facebook
await HybridAuthService.signInWithFacebook();

// Sign out
await HybridAuthService.signOut();

// Check if authenticated
const isAuth = await HybridAuthService.isAuthenticated();

// Get access token
const token = await HybridAuthService.getAccessToken();
```

### In React Components

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signInWithGoogle, signOut } = useAuth();

  return (
    <View>
      {user ? (
        <>
          <Text>Welcome {user.email}</Text>
          <Button title="Sign Out" onPress={signOut} />
        </>
      ) : (
        <>
          <Button title="Sign in with Google" onPress={signInWithGoogle} />
          <Button title="Sign in with Facebook" onPress={signInWithFacebook} />
        </>
      )}
    </View>
  );
}
```

### OAuth Callback Handler

Create `app/auth/callback.tsx`:

```typescript
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { handleAuthCallback } from '@/lib/auth/oidc-manager';
import { View, Text, ActivityIndicator } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get the URL that opened the app
      const url = window.location.href; // For web
      // For native, use Linking.getInitialURL()
      
      if (url) {
        await handleAuthCallback(url);
        router.replace('/');
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      router.replace('/auth/signin?error=oauth_failed');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text>Completing sign in...</Text>
    </View>
  );
}
```

## Configuration Details

### OIDC Config (`oidc-config.ts`)

```typescript
{
  authority: 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_XXXXXXX',
  client_id: 'MOBILE_CLIENT_ID',
  redirect_uri: 'ndotoniapp://auth/callback', // or exp://127.0.0.1:8081 for dev
  response_type: 'code',
  scope: 'email openid profile',
  cognitoDomain: 'https://rental-app-dev-055929692194.auth.us-west-2.amazoncognito.com',
  logout_uri: 'ndotoniapp://',
  automaticSilentRenew: true,
  loadUserInfo: true
}
```

### Storage

- **Amplify Auth**: Uses `@react-native-async-storage/async-storage` automatically
- **OIDC**: Custom AsyncStorage adapter for token storage

## Testing

### Expo Go (Development)

```bash
npm run start
```

**OAuth Flow:**
1. Tap "Sign in with Google"
2. Browser opens with Cognito Hosted UI
3. Authenticate with Google
4. Redirects to `exp://127.0.0.1:8081`
5. App handles callback

**Note:** Deep linking in Expo Go can be unreliable. For production, use EAS Build.

### EAS Build (Production)

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

**OAuth Flow:**
1. Tap "Sign in with Google"
2. Browser opens with Cognito Hosted UI
3. Authenticate with Google
4. Redirects to `ndotoniapp://auth/callback`
5. App handles callback reliably

## Troubleshooting

### Issue: "Invalid redirect_uri"

**Cause:** Redirect URI not configured in Cognito

**Solution:**
```bash
# Check Cognito client configuration
aws cognito-idp describe-user-pool-client \
  --user-pool-id us-west-2_XXXXXXX \
  --client-id MOBILE_CLIENT_ID \
  --region us-west-2 \
  --profile dev
```

Ensure callback URLs include:
- `ndotoniapp://auth/callback`
- `exp://127.0.0.1:8081` (for Expo Go)

### Issue: "Deep link not working"

**Cause:** App not registered for deep linking

**Solution:**
1. Check `app.json` has correct scheme
2. Rebuild app (deep linking requires native code)
3. Test with EAS Build (not Expo Go)

### Issue: "Token expired"

**Cause:** Access token expired (1 hour lifetime)

**Solution:**
```typescript
// OIDC handles automatic token refresh
// Just call getAccessToken() - it will refresh if needed
const token = await HybridAuthService.getAccessToken();
```

### Issue: "User not found in backend"

**Cause:** Post-confirmation trigger didn't create user

**Solution:**
1. Check CloudWatch logs for post-confirmation Lambda
2. Verify Lambda has DynamoDB permissions
3. Check user was added to correct group

## Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use environment-specific configs
3. ✅ Validate tokens on backend
4. ✅ Use HTTPS only
5. ✅ Implement rate limiting
6. ✅ Clear tokens on sign out
7. ✅ Use SRP auth flow for email/password
8. ✅ Use authorization code flow for OAuth
9. ✅ Store tokens securely (AsyncStorage is encrypted on device)
10. ✅ Implement token refresh

## Migration from Amplify-Only

If you're currently using Amplify for everything:

### Step 1: Install OIDC
```bash
npm install oidc-client-ts --save
```

### Step 2: Update AuthContext
Replace Amplify social auth calls with OIDC:

```typescript
// Before (Amplify)
import { signInWithRedirect } from 'aws-amplify/auth';
await signInWithRedirect({ provider: 'Google' });

// After (OIDC)
import HybridAuthService from '@/lib/auth/hybrid-auth-service';
await HybridAuthService.signInWithGoogle();
```

### Step 3: Test
1. Email/password should work as before (Amplify)
2. Social auth now uses OIDC (more reliable)

## Benefits

### Amplify Auth (Email/Password)
- ✅ Simple API
- ✅ Built-in SRP authentication
- ✅ Automatic token management
- ✅ Works great for email/password

### OIDC (Social Auth)
- ✅ Standard OAuth 2.0 / OIDC protocol
- ✅ Better browser handling
- ✅ More reliable deep linking
- ✅ Works with any OIDC provider
- ✅ Better error handling

### Hybrid Approach
- ✅ Best of both worlds
- ✅ Unified API via HybridAuthService
- ✅ Seamless user experience
- ✅ Production-ready

## Next Steps

1. Install dependencies
2. Configure environment variables
3. Update AuthContext to use HybridAuthService
4. Create OAuth callback handler
5. Test in Expo Go
6. Build with EAS for production
7. Deploy and monitor

## Resources

- [oidc-client-ts Documentation](https://github.com/authts/oidc-client-ts)
- [Expo Web Browser](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
- [Expo Linking](https://docs.expo.dev/versions/latest/sdk/linking/)
- [Cognito OAuth Endpoints](https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)
