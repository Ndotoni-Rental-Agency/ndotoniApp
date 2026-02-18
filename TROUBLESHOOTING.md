# Troubleshooting Guide

## Error: "getDevServer is not a function"

This error occurs due to a compatibility issue between Expo SDK 54 and certain Metro bundler configurations.

### Solutions (Try in order):

### 1. Use Expo Go App (Recommended for Development)
Instead of using the iOS simulator, use the Expo Go app on your physical device:

1. Install Expo Go from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in the terminal
3. The app should load without the error

### 2. Clear All Caches
```bash
cd ndotoniApp

# Clear Expo cache
rm -rf .expo

# Clear Metro cache
rm -rf node_modules/.cache

# Clear watchman
watchman watch-del-all

# Restart with clean cache
npx expo start -c
```

### 3. Downgrade @expo/metro-runtime (If using simulator)
The peer dependency warning suggests a version mismatch:

```bash
cd ndotoniApp
pnpm add @expo/metro-runtime@^6.1.2
npx expo start -c
```

### 4. Use Development Build Instead of Expo Go
If you need simulator support, create a development build:

```bash
cd ndotoniApp

# Install expo-dev-client
npx expo install expo-dev-client

# Create development build for iOS
npx expo run:ios

# Or for Android
npx expo run:android
```

### 5. Temporary Workaround: Use Web Version
While debugging, you can test on web:

```bash
npx expo start
# Press 'w' to open in web browser
```

## Current Status

✅ Metro bundler is running correctly
✅ Dependencies are installed
✅ Code has no syntax errors
❌ iOS simulator has runtime compatibility issue

## Recommended Approach

For now, use one of these methods:

1. **Physical Device + Expo Go** (Easiest)
   - Install Expo Go app
   - Scan QR code
   - Test all features

2. **Web Browser** (Quick testing)
   - Press 'w' in terminal
   - Test UI and logic
   - Note: Some native features won't work

3. **Development Build** (Production-like)
   - Run `npx expo run:ios`
   - Full native features
   - Takes longer to build

## Known Issues

- Expo SDK 54 + React Native 0.81.5 has Metro bundler compatibility issues
- The error appears in iOS simulator but not on physical devices
- Web version works fine for UI testing

## Next Steps

1. Test on physical device with Expo Go
2. If issues persist, consider upgrading to Expo SDK 55 (when stable)
3. Or create a development build for simulator testing

## Additional Commands

```bash
# Check Expo doctor for issues
npx expo-doctor

# Update all Expo packages
npx expo install --fix

# Prebuild for native development
npx expo prebuild

# Run on specific iOS simulator
npx expo run:ios --device "iPhone 15 Pro"
```

## Support

If issues persist:
1. Check Expo forums: https://forums.expo.dev
2. Check GitHub issues: https://github.com/expo/expo/issues
3. Expo Discord: https://chat.expo.dev
