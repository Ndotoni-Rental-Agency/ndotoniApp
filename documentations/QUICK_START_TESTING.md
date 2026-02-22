# Quick Start - Testing Guide

## Build & Run

### iOS Development Build
```bash
# Build and run on iOS simulator
npx expo run:ios

# Build and run on connected iOS device
npx expo run:ios --device

# Build for specific simulator
npx expo run:ios --simulator "iPhone 15 Pro"
```

### Android Development Build
```bash
# Build and run on Android emulator
npx expo run:android

# Build and run on connected Android device
npx expo run:android --device
```

## Quick Test Scenarios

### 1. Authentication (2 min)
```
1. Open app
2. Go to Profile tab
3. Click "Sign In"
4. Try Google Sign-In ✅
5. Try email/password (requires dev build) ✅
```

### 2. Sign Up Flow (3 min)
```
1. Click "Create Account"
2. Fill in details
3. Submit
4. Should immediately see verification modal ✅
5. Enter code from email
6. Verify account
```

### 3. Property Viewing (2 min)
```
1. Go to Explore tab
2. Click any short-term property
3. Scroll through images/videos
4. Test video mute button ✅
5. Check map renders ✅
```

### 4. Communication (2 min)
```
1. On property details
2. Click WhatsApp button ✅
3. Click Message button ✅
4. Click Reserve button ✅
```

### 5. Booking Creation (3 min)
```
1. Click Reserve
2. Select dates
3. Review pricing
4. Click Reserve
5. Verify booking created ✅
```

### 6. View Bookings (2 min)
```
1. Go to Profile tab
2. Click "My Bookings" ✅
3. View upcoming bookings
4. Switch to Past/Cancelled tabs
5. Pull to refresh
```

## Common Issues & Solutions

### Issue: "Email/password sign in not working"
**Solution**: This requires a development build. Use Google Sign-In in Expo Go, or build with `npx expo run:ios`

### Issue: "WhatsApp button doesn't work"
**Solution**: WhatsApp must be installed on the device. Install WhatsApp or test on a device that has it.

### Issue: "Map not showing"
**Solution**: 
- iOS: Uses Apple Maps (should work automatically)
- Android: Requires Google Maps API key in app.json

### Issue: "Images loading slowly"
**Solution**: 
- Frontend optimization already applied (expo-image)
- Backend: Apply CloudFront optimizations (see cloudfront-image-optimization.md)

## Performance Testing

### Test Image Loading
```typescript
// Add this temporarily to test
const startTime = Date.now();
await Image.prefetch(imageUrl);
console.log(`Loaded in ${Date.now() - startTime}ms`);
```

### Test Cache
```typescript
// Check AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

const keys = await AsyncStorage.getAllKeys();
console.log('Cached keys:', keys);
```

## Debug Commands

### Clear Cache
```bash
# iOS
npx expo start --clear

# Clear AsyncStorage in app
// Add to a debug screen
import { clearAllCache } from '@/hooks/useCache';
await clearAllCache();
```

### View Logs
```bash
# iOS
npx expo run:ios --no-build-cache

# Android
npx expo run:android --no-build-cache

# Or use React Native Debugger
```

### Check Bundle Size
```bash
npx expo export --platform ios
# Check dist folder size
```

## Automated Testing Script

Create a test script to verify all features:

```typescript
// test-features.ts
export async function runTests() {
  const results = {
    auth: false,
    maps: false,
    videos: false,
    bookings: false,
    whatsapp: false,
  };

  try {
    // Test auth
    await testAuth();
    results.auth = true;

    // Test maps
    await testMaps();
    results.maps = true;

    // ... more tests
  } catch (error) {
    console.error('Test failed:', error);
  }

  return results;
}
```

## Pre-Deployment Checklist

### Code Quality
- [ ] No console.errors in production code
- [ ] All TypeScript errors resolved
- [ ] No unused imports
- [ ] Proper error handling

### Features
- [ ] Authentication works (both methods)
- [ ] Maps render correctly
- [ ] Videos play with controls
- [ ] Bookings display correctly
- [ ] WhatsApp integration works
- [ ] Caching is functional

### Performance
- [ ] Images load reasonably fast
- [ ] No memory leaks
- [ ] Smooth scrolling
- [ ] No crashes

### Platform Specific
- [ ] iOS: Apple Maps working
- [ ] Android: Google Maps working
- [ ] Both: Proper navigation
- [ ] Both: Correct styling

## Build for Production

### iOS (TestFlight)
```bash
# 1. Update version in app.json
# 2. Build
eas build --platform ios --profile production

# 3. Submit to TestFlight
eas submit --platform ios
```

### Android (Play Store)
```bash
# 1. Update version in app.json
# 2. Build
eas build --platform android --profile production

# 3. Submit to Play Store
eas submit --platform android
```

## Monitoring

### Check Logs
```bash
# iOS
npx react-native log-ios

# Android
npx react-native log-android
```

### Performance Monitoring
```typescript
// Add to app
import * as Performance from 'expo-performance';

Performance.mark('app-start');
// ... app loads
Performance.measure('app-load', 'app-start');
```

## Quick Reference

| Feature | File | Status |
|---------|------|--------|
| Auth | `contexts/AuthContext.tsx` | ✅ |
| Maps | `components/map/PropertyMapView.tsx` | ✅ |
| Videos | `components/property/PropertyMediaGallery.tsx` | ✅ |
| Bookings | `app/bookings/index.tsx` | ✅ |
| WhatsApp | `app/short-property/[id].tsx` | ✅ |
| Cache | `hooks/useCache.ts` | ✅ |

## Support

- **Issues**: See `ios-testing-issues-fixes.md`
- **Optimization**: See `cloudfront-image-optimization.md`
- **Summary**: See `IMPLEMENTATION_SUMMARY.md`

---

**Ready to test!** 🚀

Start with: `npx expo run:ios`
