# Deploy Auth Stack to Fix Sign In Error

## Current Issue
You're getting "Unknown: An unknown error has occurred" when signing in because:
- The code is configured to use `USER_PASSWORD_AUTH` (works in Expo Go)
- But Cognito is still configured for SRP authentication (requires native modules)
- The auth stack needs to be deployed to update Cognito's configuration

## Solution: Deploy the Auth Stack

### Step 1: Navigate to CDK Directory
```bash
cd packages/cdk
```

### Step 2: Deploy Auth Stack
```bash
npx cdk deploy RentalApp-Auth-dev
```

If you're using a different stage (e.g., `prod`), replace `dev` with your stage name.

If you have multiple AWS profiles configured, add the profile flag:
```bash
npx cdk deploy RentalApp-Auth-dev --profile your-aws-profile
```

### Step 3: Wait for Deployment
The deployment will take 2-5 minutes. You'll see output like:
```
✅  RentalApp-Auth-dev

Outputs:
RentalApp-Auth-dev.UserPoolId = us-west-2_xxxxx
RentalApp-Auth-dev.UserPoolClientId = xxxxxxxxxxxxx
...
```

### Step 4: Restart Expo App
After deployment completes:
```bash
# In the ndotoniApp directory
npm start -- --clear
```

### Step 5: Test Sign In
Try signing in again. It should work now!

## What Changed in the Auth Stack

The auth stack was updated to enable `USER_PASSWORD_AUTH`:

```typescript
authFlows: {
  userPassword: true,      // ← This enables USER_PASSWORD_AUTH
  userSrp: true,
  adminUserPassword: true,
  custom: true
}
```

This allows the mobile app to authenticate without native modules (works in Expo Go).

## Verification

After deployment, you can verify the configuration:

1. Go to AWS Console → Cognito → User Pools
2. Select your user pool
3. Go to "App integration" → "App clients"
4. Click on your app client
5. Under "Authentication flows", you should see:
   - ✅ ALLOW_USER_PASSWORD_AUTH
   - ✅ ALLOW_USER_SRP_AUTH
   - ✅ ALLOW_ADMIN_USER_PASSWORD_AUTH
   - ✅ ALLOW_CUSTOM_AUTH

## Troubleshooting

### If deployment fails:
- Check your AWS credentials: `aws sts get-caller-identity`
- Make sure you're in the correct AWS region
- Check CDK bootstrap: `npx cdk bootstrap`

### If sign in still fails after deployment:
1. Clear Expo cache: `npm start -- --clear`
2. Check the console logs for detailed error messages
3. Verify the deployment completed successfully
4. Try creating a new user account (sign up) first

## Next Steps

Once sign in works:
- Test sign up flow
- Test email verification
- Test forgot password
- Test Google OAuth (if configured)
