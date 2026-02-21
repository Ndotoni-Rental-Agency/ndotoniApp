# GraphQL Client with Hybrid Authentication

## Overview

The GraphQL client has been updated to work seamlessly with the hybrid authentication system (Amplify + OIDC). It now automatically detects which authentication method is being used and includes the appropriate tokens in API requests.

## How It Works

### Authentication Flow

```
User authenticates (Amplify or OIDC)
    ↓
HybridAuthService stores tokens
    ↓
GraphQLClient.executeAuthenticated() called
    ↓
Gets token from HybridAuthService
    ↓
Includes token in Authorization header
    ↓
AppSync validates token (works for both Amplify and OIDC)
    ↓
Returns data
```

### Token Handling

The client uses a custom fetch implementation that:
1. Checks if user is authenticated via `HybridAuthService`
2. Gets the access token (from Amplify or OIDC)
3. Includes it in the `Authorization` header
4. AppSync validates the token (both are Cognito JWT tokens)

## Key Changes

### Before (Amplify Only)
```typescript
// Only worked with Amplify Auth tokens
const result = await amplifyClient.graphql({
  query,
  variables,
  authMode: 'userPool',
});
```

### After (Hybrid Support)
```typescript
// Works with both Amplify and OIDC tokens
const token = await HybridAuthService.getAccessToken();
const response = await fetch(GRAPHQL_ENDPOINT, {
  method: 'POST',
  headers: {
    'Authorization': token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query, variables }),
});
```

## Usage

### No Changes Required!

The GraphQL client API remains the same. Your existing code continues to work:

```typescript
import GraphQLClient from '@/lib/graphql-client';
import { getMe } from '@/lib/graphql/queries';

// Authenticated request (works with Amplify or OIDC tokens)
const data = await GraphQLClient.executeAuthenticated<{ getMe: UserProfile }>(
  getMe
);

// Public request (uses API Key)
const properties = await GraphQLClient.executePublic<{ listProperties: Property[] }>(
  listProperties
);

// Auto-detect auth mode
const result = await GraphQLClient.execute<{ someQuery: any }>(
  someQuery
);
```

## Authentication Methods Supported

### 1. Amplify Auth (Email/Password)
```typescript
// User signs in with Amplify
await HybridAuthService.signIn('user@example.com', 'password');

// GraphQL client automatically uses Amplify token
const data = await GraphQLClient.executeAuthenticated(query);
```

### 2. OIDC (Google/Facebook)
```typescript
// User signs in with Google
await HybridAuthService.signInWithGoogle();

// GraphQL client automatically uses OIDC token
const data = await GraphQLClient.executeAuthenticated(query);
```

### 3. API Key (Guest/Public)
```typescript
// No authentication required
const data = await GraphQLClient.executePublic(query);
```

## Token Format

Both Amplify and OIDC tokens are Cognito JWT tokens with the same structure:

```json
{
  "sub": "user-id",
  "cognito:groups": ["TENANTS"],
  "email": "user@example.com",
  "iss": "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_XXXXXXX",
  "exp": 1234567890,
  "iat": 1234567890
}
```

AppSync validates both tokens the same way, so the client doesn't need to distinguish between them.

## Error Handling

### Authentication Errors

```typescript
try {
  const data = await GraphQLClient.executeAuthenticated(query);
} catch (error) {
  if (error.message.includes('User not authenticated')) {
    // User needs to sign in
    router.push('/auth/signin');
  } else if (error.message.includes('Unauthorized')) {
    // Token expired or invalid
    await HybridAuthService.signOut();
    router.push('/auth/signin');
  } else {
    // Other error
    console.error('GraphQL error:', error);
  }
}
```

### Network Errors

```typescript
try {
  const data = await GraphQLClient.executePublic(query);
} catch (error) {
  if (error.message.includes('HTTP error')) {
    // Network or server error
    showToast('Network error. Please try again.');
  } else {
    // GraphQL error
    showToast(error.message);
  }
}
```

## Debugging

### Enable Logging

The client logs authentication details:

```typescript
console.log('[GraphQLClient] Authenticated request:', { 
  authMethod: 'amplify' | 'oidc',
  hasAccessToken: true,
  tokenPreview: 'eyJhbGciOiJSUzI1NiIs...'
});
```

### Check Token

```typescript
import HybridAuthService from '@/lib/auth/hybrid-auth-service';

// Get current token
const token = await HybridAuthService.getAccessToken();
console.log('Token:', token);

// Check auth method
const method = HybridAuthService.getCurrentAuthMethod();
console.log('Auth method:', method); // 'amplify' or 'oidc'

// Check if authenticated
const isAuth = await HybridAuthService.isAuthenticated();
console.log('Is authenticated:', isAuth);
```

## Configuration

### Environment Variables

```env
# AppSync Configuration
EXPO_PUBLIC_GRAPHQL_ENDPOINT=https://xxxxx.appsync-api.us-west-2.amazonaws.com/graphql
EXPO_PUBLIC_API_KEY=da2-xxxxxxxxxxxxx

# Cognito Configuration (for both Amplify and OIDC)
EXPO_PUBLIC_USER_POOL_ID=us-west-2_XXXXXXX
EXPO_PUBLIC_MOBILE_CLIENT_ID=XXXXXXXXXXXX
EXPO_PUBLIC_COGNITO_DOMAIN=rental-app-dev-055929692194.auth.us-west-2.amazoncognito.com
EXPO_PUBLIC_REGION=us-west-2
```

## AppSync Authorization

### Cognito User Pool Authorizer

AppSync is configured to accept Cognito JWT tokens:

```typescript
// In CDK (already configured)
const api = new appsync.GraphqlApi(this, 'Api', {
  authorizationConfig: {
    defaultAuthorization: {
      authorizationType: appsync.AuthorizationType.API_KEY,
    },
    additionalAuthorizationModes: [
      {
        authorizationType: appsync.AuthorizationType.USER_POOL,
        userPoolConfig: {
          userPool: authStack.userPool,
        },
      },
    ],
  },
});
```

This validates tokens from:
- ✅ Amplify Auth (email/password)
- ✅ OIDC (Google/Facebook via Cognito)
- ✅ Any Cognito-issued JWT token

## Testing

### Test Amplify Auth

```typescript
// Sign in with Amplify
await HybridAuthService.signIn('test@example.com', 'Password123!');

// Make authenticated request
const data = await GraphQLClient.executeAuthenticated(getMe);
console.log('User:', data.getMe);

// Should work ✅
```

### Test OIDC Auth

```typescript
// Sign in with Google
await HybridAuthService.signInWithGoogle();
// (Browser opens, user authenticates, app receives callback)

// Make authenticated request
const data = await GraphQLClient.executeAuthenticated(getMe);
console.log('User:', data.getMe);

// Should work ✅
```

### Test Public Access

```typescript
// No authentication
const properties = await GraphQLClient.executePublic(listProperties);
console.log('Properties:', properties.listProperties);

// Should work ✅
```

## Performance

### Token Caching

Tokens are cached by `HybridAuthService`:
- Amplify tokens: Cached by Amplify Auth
- OIDC tokens: Cached in AsyncStorage

No need to manually cache tokens.

### Request Optimization

```typescript
// Batch multiple queries
const [user, properties, bookings] = await Promise.all([
  GraphQLClient.executeAuthenticated(getMe),
  GraphQLClient.executeAuthenticated(listMyProperties),
  GraphQLClient.executeAuthenticated(listMyBookings),
]);
```

## Migration Guide

### From Old GraphQL Client

If you're using the old client:

```typescript
// Old (Amplify only)
import { generateClient } from 'aws-amplify/api';
const client = generateClient();
const result = await client.graphql({ query, authMode: 'userPool' });

// New (Hybrid support)
import GraphQLClient from '@/lib/graphql-client';
const result = await GraphQLClient.executeAuthenticated(query);
```

### Update Imports

```typescript
// Before
import { generateClient } from 'aws-amplify/api';

// After
import GraphQLClient from '@/lib/graphql-client';
```

### Update Calls

```typescript
// Before
const client = generateClient();
const result = await client.graphql({
  query: getMe,
  authMode: 'userPool'
});

// After
const result = await GraphQLClient.executeAuthenticated<{ getMe: UserProfile }>(
  getMe
);
```

## Troubleshooting

### Issue: "No authentication token available"

**Cause:** User not signed in or token expired

**Solution:**
```typescript
// Check if authenticated
const isAuth = await HybridAuthService.isAuthenticated();
if (!isAuth) {
  // Redirect to sign in
  router.push('/auth/signin');
}
```

### Issue: "Unauthorized" from AppSync

**Cause:** Token invalid or expired

**Solution:**
```typescript
// Sign out and sign in again
await HybridAuthService.signOut();
router.push('/auth/signin');
```

### Issue: "HTTP error! status: 401"

**Cause:** Token not included in request or invalid

**Solution:**
```typescript
// Check token
const token = await HybridAuthService.getAccessToken();
console.log('Token:', token);

// If no token, sign in
if (!token) {
  await HybridAuthService.signIn(email, password);
}
```

## Security

### Token Storage

- ✅ Amplify tokens: Stored securely by Amplify Auth
- ✅ OIDC tokens: Stored in AsyncStorage (encrypted on device)
- ✅ Never logged in production
- ✅ Cleared on sign out

### Token Transmission

- ✅ Always sent over HTTPS
- ✅ Included in Authorization header
- ✅ Never in URL or query params
- ✅ Validated by AppSync

### Best Practices

1. ✅ Always use `executeAuthenticated` for protected operations
2. ✅ Use `executePublic` for guest operations
3. ✅ Handle authentication errors gracefully
4. ✅ Sign out on token expiration
5. ✅ Never log tokens in production
6. ✅ Use HTTPS only
7. ✅ Validate responses

## Summary

The updated GraphQL client:
- ✅ Works with both Amplify and OIDC authentication
- ✅ Automatically detects auth method
- ✅ Includes correct tokens in requests
- ✅ Maintains same API (no breaking changes)
- ✅ Handles errors gracefully
- ✅ Supports public and authenticated requests
- ✅ Production-ready

No changes needed to your existing code - it just works!
