# Fix: Expo Go Authentication Error

## Problem
Error: `The package '@aws-amplify/react-native' doesn't seem to be linked`

This happens because AWS Amplify's SRP authentication requires native modules that aren't available in Expo Go.

## Solution Applied

### 1. Updated Auth Bridge
Changed authentication to use `USER_PASSWORD_AUTH` instead of SRP:
- **File**: `lib/auth-bridge.ts`
- **Change**: Added `authFlowType: 'USER_PASSWORD_AUTH'` option
- **Benefit**: No native modules required, works in Expo Go

### 2. Updated Auth Stack (CDK)
Enabled USER_PASSWORD_AUTH in Cognito User Pool Client:
- **File**: `packages/cdk/lib/stacks/auth-stack.ts`
- **Change**: Added explicit auth flows including `ALLOW_USER_PASSWORD_AUTH`
- **Action Required**: Deploy the auth stack

## Deploy Auth Stack

Run this command to enable USER_PASSWORD_AUTH:

```bash
cd packages/cdk
npm run deploy:auth
```

Or deploy all stacks:

```bash
npm run deploy
```

## After Deployment

1. Restart your Expo app
2. Try signing in again
3. It should work now!

## Alternative: Use Development Build

If you need SRP authentication (more secure) or other native features:

### Build a Development Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS simulator
eas build --profile development --platform ios

# Or build for Android
eas build --profile development --platform android
```

Then run with:
```bash
npx expo start --dev-client
```

## Comparison

| Feature | Expo Go | Development Build |
|---------|---------|-------------------|
| Setup | Easy, instant | Requires build (~15 min) |
| Native Modules | ❌ Limited | ✅ Full support |
| SRP Auth | ❌ No | ✅ Yes |
| USER_PASSWORD_AUTH | ✅ Yes | ✅ Yes |
| Google Maps | ✅ Yes | ✅ Yes |
| Custom Native Code | ❌ No | ✅ Yes |

## Current Status

- ✅ Polyfills added
- ✅ Auth bridge updated to use USER_PASSWORD_AUTH
- ⏳ Auth stack updated (needs deployment)
- ⏳ Test after deployment

## Security Note

USER_PASSWORD_AUTH is slightly less secure than SRP because the password is sent to Cognito (over HTTPS). However:
- It's still secure (HTTPS encrypted)
- Widely used in production apps
- Recommended by AWS for mobile apps without native modules
- SRP requires native modules not available in Expo Go

For maximum security in production, consider using a development build with SRP.
