# Environment Variables in Expo

## Overview
This project uses environment variables to manage configuration across different environments (development, staging, production).

## Setup

### 1. Local Development

Create a `.env` file in the root directory (already created):

```bash
# AWS Amplify Configuration
EXPO_PUBLIC_AWS_REGION=us-west-2
EXPO_PUBLIC_AWS_USER_POOL_ID=your_user_pool_id
EXPO_PUBLIC_AWS_USER_POOL_WEB_CLIENT_ID=your_client_id
EXPO_PUBLIC_AWS_APPSYNC_ENDPOINT=https://your-api-id.appsync-api.us-west-2.amazonaws.com/graphql
EXPO_PUBLIC_AWS_APPSYNC_API_KEY=your_api_key

# Google Maps API Key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAmuUwdIwg_Jz6TGqOpzpWDvKl5YdvNP6w

# CloudFront Domain
EXPO_PUBLIC_CLOUDFRONT_DOMAIN=https://d2bstvyam1bm1f.cloudfront.net

# S3 Bucket
EXPO_PUBLIC_S3_BUCKET=ndotoni-media-storage-dev

# Environment
EXPO_PUBLIC_ENV=development
```

### 2. Important Rules

1. **Prefix Required**: All environment variables MUST be prefixed with `EXPO_PUBLIC_` to be accessible in the app
2. **No Secrets**: Don't put sensitive secrets in `.env` - they will be bundled into the app
3. **Restart Required**: After changing `.env`, restart the dev server (`npm start` or `expo start`)

## Usage in Code

### Import the env config:

```typescript
import env from '@/config/env';

// Use environment variables
console.log(env.AWS_REGION);
console.log(env.CLOUDFRONT_DOMAIN);
```

### Direct access (alternative):

```typescript
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_AWS_APPSYNC_API_KEY;
```

## iOS Preview (Expo Go)

✅ **Environment variables work perfectly with iOS Preview!**

1. Make sure your `.env` file is in the root directory
2. Restart the dev server: `npm start` or `expo start`
3. Reload the app in Expo Go (shake device → Reload)

The environment variables will be automatically loaded and available in the app.

## Production Builds (EAS)

For production builds with EAS, you have two options:

### Option 1: EAS Secrets (Recommended for sensitive data)

```bash
# Create secrets
eas secret:create --name EXPO_PUBLIC_AWS_APPSYNC_API_KEY --value "your-api-key"
eas secret:create --name EXPO_PUBLIC_AWS_USER_POOL_ID --value "your-pool-id"

# List secrets
eas secret:list

# Delete a secret
eas secret:delete --name EXPO_PUBLIC_AWS_APPSYNC_API_KEY
```

### Option 2: eas.json Configuration

Add to `eas.json`:

```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_ENV": "development"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_ENV": "staging"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  }
}
```

## Different Environments

### Development (.env)
```bash
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_AWS_APPSYNC_ENDPOINT=https://dev-api.example.com/graphql
```

### Staging (.env.staging)
```bash
EXPO_PUBLIC_ENV=staging
EXPO_PUBLIC_AWS_APPSYNC_ENDPOINT=https://staging-api.example.com/graphql
```

### Production (.env.production)
```bash
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_AWS_APPSYNC_ENDPOINT=https://api.example.com/graphql
```

Load different env files:
```bash
# Development (default)
npm start

# Staging
cp .env.staging .env && npm start

# Production
cp .env.production .env && npm start
```

## Troubleshooting

### Variables not loading?

1. **Check the prefix**: Must start with `EXPO_PUBLIC_`
2. **Restart dev server**: Changes require a restart
3. **Clear cache**: `expo start -c`
4. **Check file location**: `.env` must be in root directory
5. **Reload app**: Shake device → Reload in Expo Go

### Variables undefined in app?

```typescript
// Debug: Check what's available
import Constants from 'expo-constants';
console.log('Extra config:', Constants.expoConfig?.extra);
```

### iOS Preview not working?

1. Ensure `.env` is in root directory (not in subdirectories)
2. Restart Metro bundler: `expo start -c`
3. Reload app in Expo Go
4. Check that variables are prefixed with `EXPO_PUBLIC_`

## Security Best Practices

1. ✅ **DO**: Use environment variables for API endpoints, feature flags, non-sensitive config
2. ✅ **DO**: Use EAS Secrets for sensitive production values
3. ❌ **DON'T**: Put private keys, passwords, or secrets in `.env`
4. ❌ **DON'T**: Commit `.env` to git (it's in `.gitignore`)
5. ✅ **DO**: Commit `.env.example` as a template

## Files

- `.env` - Local development variables (gitignored)
- `.env.example` - Template for required variables (committed)
- `config/env.ts` - Typed environment configuration
- `.gitignore` - Ensures `.env` is not committed

## References

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Secrets](https://docs.expo.dev/build-reference/variables/)
- [expo-constants](https://docs.expo.dev/versions/latest/sdk/constants/)
