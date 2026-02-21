# Mobile App Authentication Setup

## Overview

The mobile app (ndotoniApp) now has its own dedicated Cognito User Pool Client, separate from the web client. This provides better security, configuration flexibility, and follows AWS best practices.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Cognito User Pool                      │
│                 (rental-app-users-dev)                  │
└─────────────────────────────────────────────────────────┘
                    │                    │
        ┌───────────┴──────────┐        │
        │                      │        │
        ▼                      ▼        ▼
┌──────────────┐      ┌──────────────┐ ┌──────────────┐
│  Web Client  │      │Mobile Client │ │Post-Confirm  │
│  (Next.js)   │      │(React Native)│ │   Lambda     │
│              │      │              │ │              │
│ • OAuth      │      │ • Email/Pass │ │ • Create User│
│ • Social     │      │ • SRP Auth   │ │ • Add Group  │
│ • Hosted UI  │      │ • No OAuth   │ │ • Send Event │
└──────────────┘      └──────────────┘ └──────────────┘
```

## CDK Configuration

### User Pool Clients

**Web Client** (`rental-app-web-{stage}`)
- OAuth/Hosted UI enabled
- Social providers (Google, Facebook)
- Authorization code grant flow
- Callback URLs for web

**Mobile Client** (`rental-app-mobile-{stage}`)
- Email/password authentication only
- SRP (Secure Remote Password) auth flow
- No OAuth/Hosted UI (not needed for Expo Go)
- No client secret (mobile apps can't store secrets securely)

### Auth Flows Enabled

Both clients support:
- ✅ `USER_PASSWORD_AUTH` - Username/password authentication
- ✅ `USER_SRP_AUTH` - Secure Remote Password (recommended)

Web client additionally supports:
- ✅ `ADMIN_USER_PASSWORD_AUTH` - Admin operations
- ✅ `CUSTOM_AUTH` - Custom authentication flows

## Environment Variables

### For Mobile App (ndotoniApp)

Create or update `.env` file:

```env
# Cognito Configuration
EXPO_PUBLIC_USER_POOL_ID=us-west-2_XXXXXXX
EXPO_PUBLIC_MOBILE_CLIENT_ID=XXXXXXXXXXXX
EXPO_PUBLIC_REGION=us-west-2

# AppSync Configuration
EXPO_PUBLIC_GRAPHQL_ENDPOINT=https://xxxxx.appsync-api.us-west-2.amazonaws.com/graphql
EXPO_PUBLIC_API_KEY=da2-xxxxxxxxxxxxx
```

### Getting the Values

After deploying the CDK stack:

```bash
# Get User Pool ID
aws cloudformation describe-stacks \
  --stack-name RentalAppAuthStack-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text

# Get Mobile Client ID
aws cloudformation describe-stacks \
  --stack-name RentalAppAuthStack-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`MobileClientId`].OutputValue' \
  --output text

# Get Web Client ID (for reference)
aws cloudformation describe-stacks \
  --stack-name RentalAppAuthStack-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`WebClientId`].OutputValue' \
  --output text
```

Or use the helper script:

```bash
cd ndotoniApp
./scripts/get-cognito-config.sh
```

## Amplify Configuration for Mobile

**File: `ndotoniApp/lib/amplify-config.ts`**

```typescript
import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID!,
      userPoolClientId: process.env.EXPO_PUBLIC_MOBILE_CLIENT_ID!,
      // Note: No OAuth configuration for mobile (Expo Go limitation)
    }
  },
  API: {
    GraphQL: {
      endpoint: process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT!,
      region: process.env.EXPO_PUBLIC_REGION || 'us-west-2',
      defaultAuthMode: 'apiKey',
      apiKey: process.env.EXPO_PUBLIC_API_KEY!
    }
  }
};

Amplify.configure(amplifyConfig);

export default amplifyConfig;
```

## Authentication Service for Mobile

**File: `ndotoniApp/lib/auth-service.ts`**

```typescript
import { 
  signUp, 
  signIn, 
  signOut, 
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession
} from 'aws-amplify/auth';

export class AuthService {
  /**
   * Sign up with email/password
   */
  static async signUp(
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string,
    phoneNumber?: string
  ) {
    return await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          given_name: firstName,
          family_name: lastName,
          ...(phoneNumber && { phone_number: phoneNumber })
        }
      }
    });
  }

  /**
   * Confirm email with verification code
   */
  static async confirmSignUp(email: string, code: string) {
    return await confirmSignUp({
      username: email,
      confirmationCode: code
    });
  }

  /**
   * Resend verification code
   */
  static async resendCode(email: string) {
    return await resendSignUpCode({
      username: email
    });
  }

  /**
   * Sign in with email/password
   */
  static async signIn(email: string, password: string) {
    return await signIn({
      username: email,
      password
    });
  }

  /**
   * Sign out
   */
  static async signOut() {
    return await signOut();
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    return await getCurrentUser();
  }

  /**
   * Check if authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get access token for API calls
   */
  static async getAccessToken(): Promise<string | undefined> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString();
    } catch {
      return undefined;
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(email: string) {
    return await resetPassword({
      username: email
    });
  }

  /**
   * Confirm password reset
   */
  static async confirmForgotPassword(
    email: string, 
    code: string, 
    newPassword: string
  ) {
    return await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword
    });
  }
}
```

## What Works in Expo Go

### ✅ Supported
- Email/password sign up
- Email verification
- Email/password sign in
- Password reset
- JWT token management
- Automatic token refresh
- Sign out

### ❌ Not Supported (Requires EAS Build)
- Google Sign-In
- Facebook Sign-In
- Apple Sign-In
- OAuth Hosted UI
- Deep linking for OAuth

## Migration from Shared Client

If you're currently using the shared client (old setup):

### Step 1: Update Environment Variables
```bash
# Old
EXPO_PUBLIC_USER_POOL_CLIENT_ID=4k6u174tgu4glhi814ulihckh4

# New
EXPO_PUBLIC_MOBILE_CLIENT_ID=<new-mobile-client-id>
```

### Step 2: Update Amplify Config
```typescript
// Old
userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID

// New
userPoolClientId: process.env.EXPO_PUBLIC_MOBILE_CLIENT_ID
```

### Step 3: Test Authentication
1. Sign up with new account
2. Verify email
3. Sign in
4. Test token refresh
5. Test sign out

### Step 4: Deploy
```bash
# Deploy CDK stack
cd packages/cdk
npm run deploy:dev

# Update mobile app
cd ndotoniApp
npm run start
```

## Benefits of Separate Clients

### 1. Security
- Different auth flows for different platforms
- No OAuth complexity in mobile (reduces attack surface)
- Platform-specific token lifetimes

### 2. Configuration Flexibility
- Enable/disable features per platform
- Different callback URLs
- Platform-specific settings

### 3. Monitoring & Analytics
- Track usage per platform
- Separate metrics for web vs mobile
- Better debugging

### 4. Compliance
- Meet platform-specific requirements
- Easier audit trails
- Better access control

## Troubleshooting

### Issue: "Invalid client id"
**Solution**: Make sure you're using `EXPO_PUBLIC_MOBILE_CLIENT_ID`, not the web client ID.

### Issue: "OAuth not configured"
**Solution**: This is expected. Mobile client doesn't support OAuth in Expo Go. Use email/password auth.

### Issue: "User not confirmed"
**Solution**: User needs to verify email. Show verification code input.

### Issue: "Token expired"
**Solution**: Amplify handles token refresh automatically. If this persists, sign out and sign in again.

### Issue: "Network error"
**Solution**: Check that AppSync endpoint and API key are correct in `.env`.

## Testing Checklist

- [ ] Sign up with email/password
- [ ] Receive verification email
- [ ] Verify email with code
- [ ] Sign in with verified account
- [ ] Access protected GraphQL queries
- [ ] Token refresh works automatically
- [ ] Sign out clears session
- [ ] Forgot password flow
- [ ] Reset password with code
- [ ] Error handling for invalid credentials
- [ ] Error handling for unverified email

## Production Deployment

### 1. Update Environment Variables
```bash
# Production
EXPO_PUBLIC_USER_POOL_ID=us-west-2_PROD_ID
EXPO_PUBLIC_MOBILE_CLIENT_ID=PROD_CLIENT_ID
EXPO_PUBLIC_GRAPHQL_ENDPOINT=https://prod.appsync-api.us-west-2.amazonaws.com/graphql
```

### 2. Build for Production
```bash
# EAS Build (for social auth support)
eas build --platform ios
eas build --platform android

# Or Expo Go (email/password only)
expo publish
```

### 3. Monitor
- CloudWatch logs for post-confirmation Lambda
- Cognito user pool metrics
- AppSync API metrics

## Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use environment-specific configs
3. ✅ Rotate API keys regularly
4. ✅ Monitor failed auth attempts
5. ✅ Enable MFA for admin accounts
6. ✅ Use SRP auth flow (not USER_PASSWORD_AUTH)
7. ✅ Implement rate limiting on client side
8. ✅ Clear tokens on sign out
9. ✅ Validate tokens on backend
10. ✅ Use HTTPS only

## Next Steps

1. Deploy updated CDK stack
2. Get new mobile client ID
3. Update mobile app environment variables
4. Test authentication flows
5. Update documentation
6. Train team on new setup

## Resources

- [AWS Amplify Auth Docs](https://docs.amplify.aws/react-native/build-a-backend/auth/)
- [Cognito User Pool Clients](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html)
- [Expo Authentication Guide](https://docs.expo.dev/guides/authentication/)
- [SRP Authentication](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow.html)
