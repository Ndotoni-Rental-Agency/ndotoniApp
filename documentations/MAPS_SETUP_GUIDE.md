# React Native Maps Setup Guide

## Installation

Run this command in the `ndotoniApp` directory:

```bash
npx expo install react-native-maps
```

This will install the correct version of react-native-maps that's compatible with your Expo SDK.

## Configuration

### For Development (Expo Go)
No additional configuration needed! The map will work immediately in Expo Go using the default map provider.

### For Production Builds

#### Option 1: Using Default Maps (Recommended for Quick Start)
No API keys needed! The app will use:
- Apple Maps on iOS
- Google Maps on Android (with limited features)

#### Option 2: Using Google Maps (Full Features)

##### 1. Get Google Maps API Keys

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
4. Create credentials:
   - For Android: Create an API key (restrict to Android apps)
   - For iOS: Create an API key (restrict to iOS apps)

##### 2. Add API Keys to app.json

Update `ndotoniApp/app.json`:

```json
{
  "expo": {
    "name": "ndotoniApp",
    "slug": "ndotoniapp",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.ndotoni.app",
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY_HERE"
      }
    },
    "android": {
      "package": "com.ndotoni.app",
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY_HERE"
        }
      }
    }
  }
}
```

##### 3. Secure Your API Keys

Add to `.gitignore`:
```
# API Keys
app.json.local
```

Create `app.json.local` with your actual keys and use a build script to merge them.

## Usage

The PropertyMapView component is already implemented and ready to use:

```typescript
import PropertyMapView from '@/components/map/PropertyMapView';

<PropertyMapView
  latitude={-6.7924}
  longitude={39.2083}
  title="Property Location"
/>
```

## Features

- ✅ Interactive map with zoom and pan
- ✅ Property marker at exact location
- ✅ Centered on property coordinates
- ✅ Smooth animations
- ✅ Platform-specific providers (Apple Maps on iOS, Google Maps on Android)
- ✅ Disabled pitch and rotation for better UX
- ✅ Clean, minimal UI

## Map Providers

### iOS
- Uses Apple Maps by default (no API key needed)
- Can use Google Maps if API key is provided

### Android
- Uses Google Maps
- Limited features without API key
- Full features with API key

## Customization

### Dark Mode Support
To add dark mode to maps, update the MapView component:

```typescript
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme();

<MapView
  style={styles.map}
  customMapStyle={colorScheme === 'dark' ? darkMapStyle : []}
  // ... other props
/>
```

### Map Styles
You can customize the map appearance using `customMapStyle` prop with a JSON style array.

## Troubleshooting

### Map not showing on Android
1. Make sure you've added the Google Maps API key to `app.json`
2. Rebuild the app: `npx expo prebuild --clean`
3. Run: `npx expo run:android`

### Map not showing on iOS
1. Check if the API key is correctly added to `app.json`
2. Rebuild: `npx expo prebuild --clean`
3. Run: `npx expo run:ios`

### "Blank map" or "Gray screen"
- This usually means the API key is invalid or not properly configured
- Check the API key restrictions in Google Cloud Console
- Make sure the correct APIs are enabled

### Performance Issues
- Reduce the number of markers if showing multiple properties
- Use `clustering` for many markers
- Optimize marker images

## Testing

### In Expo Go
```bash
cd ndotoniApp
npx expo start
```
Scan the QR code with Expo Go app - maps will work immediately!

### On Device (Development Build)
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### Production Build
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## Cost Considerations

### Free Tier (No API Key)
- Apple Maps on iOS: Free, unlimited
- Google Maps on Android: Limited features, may show watermark

### With Google Maps API Key
- First $200/month of usage is free (Google Cloud credit)
- After that, pay per map load
- Typical usage for property app: Well within free tier

## Best Practices

1. **API Key Security**
   - Never commit API keys to git
   - Use environment variables or secure config
   - Restrict API keys to your app's bundle ID/package name

2. **Performance**
   - Cache map tiles when possible
   - Limit the number of markers
   - Use appropriate zoom levels

3. **User Experience**
   - Show loading state while map initializes
   - Handle location permissions gracefully
   - Provide fallback for devices without map support

4. **Privacy**
   - Show "Approximate location" disclaimer
   - Don't show exact address on map
   - Consider adding slight offset to coordinates

## Additional Resources

- [Expo Maps Documentation](https://docs.expo.dev/versions/latest/sdk/map-view/)
- [React Native Maps GitHub](https://github.com/react-native-maps/react-native-maps)
- [Google Maps Platform](https://developers.google.com/maps)
- [Apple Maps Documentation](https://developer.apple.com/maps/)

## Next Steps

1. Run `npx expo install react-native-maps`
2. Test in Expo Go (works immediately!)
3. For production: Add API keys to app.json
4. Build and test on real devices
5. Deploy to app stores

That's it! Your maps are ready to go! 🗺️
