# OAuth Not Supported in Expo Go

## TL;DR

**OAuth (Google/Facebook sign-in) does NOT work in Expo Go.** Use email/password authentication instead, or build a standalone app.

## Why OAuth Doesn't Work

Amplify's OAuth implementation requires the native `@aws-amplify/rtn-web-browser` package, which:
- Needs to be linked to native code
- Cannot run in Expo Go (managed workflow)
- Only works in standalone builds

Error you'll see:
```
The @aws-amplify/rtn-web-browser package doesn't seem to be linked.
Make sure: - You have run 'pod install'
- You rebuilt the app after installing the package  
- You are not using Expo Go
```

## What Works

✅ **Email/Password Authentication** - Works perfectly in Expo Go
✅ **All authenticated features** - Work fine with password auth
✅ **Session persistence** - Properly maintained
✅ **Token refresh** - Automatic

## What Doesn't Work

❌ **Google OAuth** - Requires native modules
❌ **Facebook OAuth** - Requires native modules  
❌ **Any social sign-in** - Not supported in Expo Go

## Solutions

### Option 1: Use Password Authentication (Recommended for Development)

This is the simplest solution and works perfectly:

```typescript
await auth.signIn(email, password);
```

All features work:
- Sign in / Sign up
- Email verification
- Password reset
- Session persistence
- Authenticated requests

### Option 2: Build Standalone App (For Production)

To enable OAuth, you need to build a standalone app:

```bash
# For iOS
eas build --platform ios

# For Android  
eas build --platform android
```

Then OAuth will work because native modules can be linked.

### Option 3: Use Expo Dev Client (Alternative)

Instead of Expo Go, use Expo Dev Client which supports native modules:

```bash
npx expo install expo-dev-client
npx expo run:ios  # or run:android
```

This gives you a development build with native module support.

## Current Implementation

The auth-bridge now throws a helpful error when OAuth is attempted in Expo Go:

```typescript
static async signInWithGoogle() {
  throw new Error(
    'Google sign-in is not available in Expo Go. ' +
    'Please use email/password authentication, or build a standalone app to use OAuth.'
  );
}
```

## UI Recommendations

### Hide OAuth Buttons in Expo Go

```typescript
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

{!isExpoGo && (
  <>
    <GoogleSignInButton />
    <FacebookSignInButton />
  </>
)}
```

### Show Helpful Message

```typescript
{isExpoGo && (
  <Text>
    OAuth sign-in is not available in Expo Go.
    Please use email/password authentication.
  </Text>
)}
```

## For Production

When building for production:

1. **Keep the current auth-bridge code** - It will work in standalone builds
2. **Test OAuth thoroughly** in a standalone build before release
3. **Configure deep linking** properly in app.json
4. **Test on both iOS and Android**

## Testing OAuth

To test OAuth during development:

1. Build a development client:
   ```bash
   npx expo install expo-dev-client
   npx expo run:ios
   ```

2. Or build with EAS:
   ```bash
   eas build --profile development --platform ios
   ```

3. Install the build on your device

4. Test OAuth flows

## Related Documentation

- [Expo Go Limitations](https://docs.expo.dev/workflow/expo-go/)
- [Expo Dev Client](https://docs.expo.dev/develop/development-builds/introduction/)
- [AWS Amplify React Native](https://docs.amplify.aws/react-native/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

## Summary

- **Development (Expo Go)**: Use password authentication only
- **Production (Standalone)**: OAuth will work fine
- **Testing OAuth**: Use Expo Dev Client or EAS development builds

The current implementation is correct for production. The limitation is only in the Expo Go development environment.
