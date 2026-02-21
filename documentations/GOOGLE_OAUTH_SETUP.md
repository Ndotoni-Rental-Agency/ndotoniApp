# Google OAuth Setup for Mobile App

## Overview
This guide explains how to configure Google OAuth for the mobile app using AWS Cognito.

## What You Need to Do

### 1. Deploy Updated Auth Stack

The auth stack has been updated to include mobile app redirect URIs. Deploy it:

```bash
cd packages/cdk
npm run deploy:auth
```

This adds the following callback URLs to Cognito:
- `ndotoniapp://` - Production mobile app
- `exp://127.0.0.1:8081` - Expo Go development (iOS)
- `exp://localhost:8081` - Expo Go development (Android)

### 2. Verify Cognito Configuration

After deployment, verify in AWS Console:

1. Go to **AWS Cognito** → **User Pools**
2. Select your user pool (e.g., `rental-app-users-dev`)
3. Go to **App integration** → **App clients**
4. Click on your app client
5. Under **Hosted UI**, verify:
   - **Allowed callback URLs** includes `ndotoniapp://`
   - **Allowed sign-out URLs** includes `ndotoniapp://`
   - **Identity providers** includes Google

### 3. Google OAuth Configuration (Already Done)

Your Google OAuth is configured through Cognito, so you don't need to add the redirect URI directly to Google Cloud Console. Cognito handles the OAuth flow:

**Flow:**
1. Mobile app → Opens Cognito Hosted UI
2. Cognito → Redirects to Google OAuth
3. Google → Redirects back to Cognito
4. Cognito → Redirects to mobile app (`ndotoniapp://`)

The redirect URI that Google sees is:
```
https://rental-app-dev-055929692194.auth.us-west-2.amazoncognito.com/oauth2/idpresponse
```

This is already configured in your Google Cloud Console.

## How It Works

### OAuth Flow

1. User taps "Continue with Google" in mobile app
2. App opens Cognito Hosted UI in browser using `expo-web-browser`
3. User authenticates with Google
4. Cognito receives tokens from Google
5. Cognito creates/updates user in User Pool
6. Cognito redirects back to app with tokens in URL fragment
7. App extracts tokens and fetches user profile from backend

### Code Implementation

The implementation uses:
- **expo-web-browser** - Opens OAuth flow in system browser
- **Implicit flow** - Returns tokens directly in URL fragment (no code exchange needed)
- **Cognito Hosted UI** - Handles OAuth with Google

### URL Scheme

The app uses `ndotoniapp://` as its URL scheme:
- Defined in `app.json` as `"scheme": "ndotoniapp"`
- Used as redirect URI in Cognito
- Allows deep linking back to app after OAuth

## Testing

### Development (Expo Go)

When testing with Expo Go, the redirect URIs are:
- iOS: `exp://127.0.0.1:8081`
- Android: `exp://localhost:8081`

These are already included in the auth stack.

### Production Build

For production builds (not Expo Go), the redirect URI is:
- `ndotoniapp://`

## Troubleshooting

### Error: "Invalid redirect URI"

**Cause:** The redirect URI is not registered in Cognito.

**Solution:**
1. Deploy the updated auth stack
2. Verify the URI is in Cognito's allowed callback URLs

### Error: "OAuth flow cancelled"

**Cause:** User closed the browser before completing OAuth.

**Solution:** This is expected behavior - user cancelled the flow.

### Error: "User profile not found"

**Cause:** User authenticated with Google but doesn't exist in your backend.

**Solution:** Ensure your post-confirmation Lambda creates the user profile in DynamoDB.

## Environment Variables

Optional: Override redirect URIs with environment variables:

```bash
# .env or app config
EXPO_PUBLIC_REDIRECT_SIGN_IN=ndotoniapp://
EXPO_PUBLIC_REDIRECT_SIGN_OUT=ndotoniapp://
```

## Next Steps

1. Deploy the updated auth stack
2. Test Google OAuth in the mobile app
3. Verify user profile is created in backend
4. Test sign out flow

## Summary

You need to:
1. ✅ Deploy updated auth stack (adds `ndotoniapp://` to Cognito)
2. ❌ No changes needed to Google Cloud Console
3. ❌ No changes needed to backend code

The redirect URI is configured in Cognito, not Google directly!
