# Google OAuth Fix Applied

## The Issue
After successful Google OAuth redirect, Amplify's session wasn't being established, causing:
```
ERROR [AuthBridge] OAuth error: [Error: Authentication required for this operation]
```

## Root Cause
When using `expo-web-browser` with OAuth implicit flow (response_type=token):
1. ✅ Tokens are returned in URL fragment
2. ✅ Tokens are parsed successfully  
3. ❌ Amplify doesn't automatically process these tokens
4. ❌ `fetchAuthSession()` returns no token

## The Fix
Updated `lib/auth-bridge.ts` to use tokens directly:
- Extract `id_token` from OAuth redirect URL
- Use token directly to fetch user profile (bypass Amplify session)
- New method: `fetchUserProfileWithToken()` makes direct GraphQL call with token

## How It Works Now
```
User → Google OAuth → Cognito → Tokens in URL
  ↓
Parse tokens from URL fragment
  ↓
Use id_token directly for GraphQL request
  ↓
Fetch user profile → Success!
```

## Test It Now
Restart the app and try Google OAuth:
```bash
npm start -- --clear
```

Then tap "Continue with Google" - it should work now!
