# Google Account Picker Fix

## The Issue
After signing in once with Google, subsequent sign-in attempts automatically use the same Google account without showing the account picker.

## The Fix
Added `prompt=select_account` parameter to the OAuth URL.

This forces Google to show the account picker every time, allowing you to:
- Choose between multiple Google accounts
- Sign in with a different account
- See all available Google accounts

## What Changed
Updated `lib/auth-bridge.ts`:
- Google OAuth: Added `prompt=select_account`
- Facebook OAuth: Added `prompt=select_account` (for consistency)

## Test It
```bash
npm start -- --clear
```

Now when you tap "Continue with Google", you'll see the account picker every time!

## How It Works
The `prompt` parameter controls Google's OAuth behavior:
- `prompt=none` - Silent authentication (no UI)
- `prompt=consent` - Always show consent screen
- `prompt=select_account` - Always show account picker ✅
- No prompt - Use last selected account (previous behavior)

## Note
This is standard OAuth behavior and is used by most apps that support multiple accounts (Gmail, YouTube, etc.).
