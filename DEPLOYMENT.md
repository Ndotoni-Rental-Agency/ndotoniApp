# Mobile App Deployment Guide

This guide covers deploying the ndotoniApp to Google Play Store and Apple App Store using EAS (Expo Application Services) and GitHub Actions.

## Prerequisites

1. **Expo Account**: Sign up at [expo.dev](https://expo.dev)
2. **EAS CLI**: `npm install -g eas-cli`
3. **Google Play Console Account** ($25 one-time fee)
4. **Apple Developer Account** ($99/year)

## Initial Setup

### 1. Configure EAS

```bash
cd ndotoniApp
eas login
eas build:configure
```

### 2. Update App Configuration

Edit `app.json` to set your app details:

```json
{
  "expo": {
    "name": "Ndotoni",
    "slug": "ndotoni",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.ndotoni",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.ndotoni",
      "versionCode": 1
    }
  }
}
```

### 3. Create App Store Listings

#### Google Play Store
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. Fill in app details, screenshots, descriptions
4. Create a service account for API access:
   - Go to Google Cloud Console
   - Create service account
   - Download JSON key
   - Grant "Service Account User" role in Play Console

#### Apple App Store
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app
3. Fill in app information
4. Create an App Store Connect API key:
   - Users and Access → Keys → App Store Connect API
   - Download the .p8 key file

## GitHub Secrets Setup

Add these secrets in GitHub (Settings → Secrets and variables → Actions):

### Required for All Builds
- `EXPO_TOKEN`: Get from `eas whoami --json` after `eas login`

### For Android Submission
- `GOOGLE_SERVICE_ACCOUNT_JSON`: Contents of the service account JSON file

### For iOS Submission
- `APPLE_ID`: Your Apple ID email
- `APPLE_APP_SPECIFIC_PASSWORD`: Generate at appleid.apple.com
- `APPLE_TEAM_ID`: Found in Apple Developer account
- `ASC_KEY_ID`: App Store Connect API Key ID
- `ASC_ISSUER_ID`: App Store Connect Issuer ID
- `ASC_KEY`: Contents of the .p8 key file

## Building Locally

### Development Build
```bash
eas build --profile development --platform android
eas build --profile development --platform ios
```

### Preview Build (APK for testing)
```bash
eas build --profile preview --platform android
```

### Production Build
```bash
eas build --profile production --platform android
eas build --profile production --platform ios
```

## Automated Deployment via GitHub

### Trigger Build Manually
1. Go to GitHub Actions tab
2. Select "EAS Build and Submit" workflow
3. Click "Run workflow"
4. Choose platform (android/ios/all) and profile

### Automatic Build on Push
Push to `main` branch triggers preview builds
Push to `production` branch triggers production builds and submission

## Submitting to Stores

### Manual Submission

#### Android
```bash
eas submit --platform android --latest
```

#### iOS
```bash
eas submit --platform ios --latest
```

### Automated Submission
Submissions happen automatically when:
- Pushing to `production` branch
- Using `production` profile
- All required secrets are configured

## Version Management

### Increment Version
Edit `app.json`:
```json
{
  "version": "1.0.1",
  "ios": { "buildNumber": "2" },
  "android": { "versionCode": 2 }
}
```

Or use auto-increment in `eas.json` (already configured).

## Testing Before Release

### Internal Testing (Android)
1. Build with preview profile
2. Download APK from EAS dashboard
3. Install on test devices

### TestFlight (iOS)
1. Build with production profile
2. Submit to TestFlight
3. Add internal/external testers in App Store Connect

## Troubleshooting

### Build Fails
- Check EAS build logs in dashboard
- Verify all dependencies are compatible
- Ensure native modules are properly configured

### Submission Fails
- Verify service account has correct permissions
- Check app version numbers are incremented
- Ensure all required metadata is filled in store consoles

### Common Issues

**Android: "App not signed"**
- EAS handles signing automatically
- Ensure you're using `app-bundle` build type for production

**iOS: "Missing compliance"**
- Add export compliance in App Store Connect
- Most apps can declare "No" for encryption

**Both: "Version already exists"**
- Increment version/build numbers
- Or enable auto-increment in eas.json

## Monitoring

- **EAS Dashboard**: [expo.dev/accounts/[account]/projects/ndotoniApp](https://expo.dev)
- **Google Play Console**: Track downloads, crashes, reviews
- **App Store Connect**: Monitor TestFlight, reviews, analytics

## Best Practices

1. **Test thoroughly** before production builds
2. **Use semantic versioning** (1.0.0 → 1.0.1 → 1.1.0)
3. **Keep secrets secure** - never commit credentials
4. **Monitor crash reports** in both consoles
5. **Respond to reviews** promptly
6. **Update regularly** with bug fixes and features

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
