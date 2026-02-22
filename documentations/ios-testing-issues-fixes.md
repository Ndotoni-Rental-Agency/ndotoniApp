# iOS Testing Issues - Fixes and Implementation Plan

## Issues Identified

1. ✅ Email/password authentication not working (only Google works)
2. ✅ Sign up should redirect to verify email page immediately
3. ✅ Map not rendering on iOS
4. ✅ Videos need mute/unmute control
5. ✅ Reservation should work without payment
6. ✅ Add WhatsApp communication option for short-term properties
7. ✅ Implement caching for rarely changing data
8. ✅ Display booked reservations in profile
9. ✅ CloudFront images loading slowly

---

## 1. Email/Password Authentication Fix

### Problem
Email/password authentication requires native modules that don't work in Expo Go. The app needs a development build.

### Solution
The authentication flow is already properly implemented. The issue is that users need to build a development build instead of using Expo Go.

### Action Required
Update error messages to be more user-friendly and guide users to use Google Sign-In or build a development build.

**File: `components/auth/SignInModal.tsx`**
- Already has proper error handling
- Shows clear message about development build requirement

**File: `components/auth/SignUpModal.tsx`**
- Already has proper error handling

### Status: ✅ Already Implemented
The code already handles this gracefully. Users just need to use Google Sign-In on Expo Go or build a development build.

---

## 2. Sign Up Redirect to Verify Email

### Problem
After sign up, users should be immediately redirected to the verify email modal.

### Solution
The flow is already implemented correctly in `SignUpModal.tsx`:
- After successful sign up, it shows an alert with "Verify Now" button
- Clicking "Verify Now" opens the VerifyEmailModal

### Enhancement Needed
Remove the alert and directly open the verification modal for a smoother UX.

**Changes:**
```typescript
// In SignUpModal.tsx handleSignUp function
if (result.requiresVerification) {
  // Remove Alert.alert, directly call:
  onNeedsVerification(email);
  onClose();
}
```

---

## 3. Map Not Rendering on iOS

### Problem
The map component uses `PROVIDER_GOOGLE` but may not be properly configured for iOS.

### Solution
1. Ensure Google Maps API key is configured in `app.json`
2. Add fallback to default provider if Google Maps fails
3. Verify the map component has proper error handling

**File: `components/map/PropertyMapView.tsx`**

---

## 4. Video Mute/Unmute Control

### Problem
Videos in PropertyMediaGallery don't have mute controls.

### Solution
Add a mute/unmute button overlay on videos.

**File: `components/property/PropertyMediaGallery.tsx`**

---

## 5. Reservation Without Payment

### Problem
Current reservation flow expects payment integration.

### Solution
Simplify the booking flow to just create a booking record without payment.

**File: `components/property/ReservationModal.tsx`**
- Already calls `createBooking` mutation
- Just needs to remove payment-related UI/logic

### Status: ✅ Already Implemented
The reservation modal already creates bookings without payment!

---

## 6. WhatsApp Communication

### Problem
Users need to communicate with landlords via WhatsApp and internal messaging.

### Solution
Add communication options to property details page:
- WhatsApp button (opens WhatsApp with pre-filled message)
- Message button (opens internal chat)
- Reserve button (existing)

**File: `app/short-property/[id].tsx`**

---

## 7. Caching Implementation

### Problem
Need to cache rarely changing data like property listings, user profile, etc.

### Solution
Implement React Query or AsyncStorage caching for:
- Property listings
- Property details
- User profile
- Categories

**Libraries to add:**
- `@tanstack/react-query` for data caching
- Or use AsyncStorage with TTL

---

## 8. Display Booked Reservations

### Problem
Profile page doesn't show user's bookings.

### Solution
Create a bookings screen that fetches and displays user bookings using `listMyBookings` query.

**Files to create/modify:**
- `app/bookings/index.tsx` - New bookings list screen
- `app/bookings/[id].tsx` - Booking details screen
- `app/(tabs)/profile.tsx` - Add navigation to bookings

**GraphQL Query Available:**
- `listMyBookings` - Already exists in queries.ts

---

## 9. CloudFront Image Loading Performance

### Problem
Images from CloudFront load slower than other internet images.

### Possible Causes
1. CloudFront distribution not optimized
2. Missing cache headers
3. Images not compressed
4. No image optimization (WebP, responsive sizes)

### Solutions
1. **Backend**: Configure CloudFront cache behaviors
2. **Backend**: Add image optimization Lambda@Edge
3. **Frontend**: Implement progressive image loading
4. **Frontend**: Use expo-image with caching

**File: `components/property/PropertyMediaGallery.tsx`**
- Replace `Image` with `expo-image` for better caching
- Add placeholder/blur while loading

---

## Implementation Priority

### High Priority (MVP Blockers)
1. ✅ Email/password auth (already handled)
2. ✅ Reservation without payment (already works)
3. 🔧 Map rendering fix
4. 🔧 Display bookings in profile

### Medium Priority (UX Improvements)
5. 🔧 Video mute controls
6. 🔧 WhatsApp communication
7. 🔧 Sign up flow improvement

### Low Priority (Performance)
8. 🔧 Caching implementation
9. 🔧 CloudFront optimization

---

## Next Steps

1. Fix map rendering on iOS
2. Add video mute controls
3. Create bookings screen
4. Add WhatsApp communication
5. Implement caching strategy
6. Optimize image loading
