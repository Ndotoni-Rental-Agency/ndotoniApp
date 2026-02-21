# Verification Emails Not Being Received

## The Issue
The API returns success when sending verification codes, but emails aren't being received.

## Most Likely Cause: SES Sandbox Mode

AWS SES (Simple Email Service) starts in **sandbox mode** by default, which means:
- ✅ You can send emails to verified email addresses only
- ❌ You cannot send to arbitrary email addresses
- ❌ Daily sending limit: 200 emails
- ❌ Sending rate: 1 email per second

## Quick Fix: Verify Your Email in SES

### Option 1: Verify Individual Email Addresses (Quick)

1. Go to AWS Console → SES (Simple Email Service)
2. Click "Verified identities" in the left menu
3. Click "Create identity"
4. Select "Email address"
5. Enter the email you want to test with (e.g., elm102@case.edu)
6. Click "Create identity"
7. Check your email for verification link
8. Click the verification link
9. Try signing up again - you should receive the code now!

### Option 2: Request Production Access (Recommended for Production)

1. Go to AWS Console → SES
2. Click "Account dashboard" in the left menu
3. Look for "Sending statistics" section
4. Click "Request production access" button
5. Fill out the form:
   - **Mail type**: Transactional
   - **Website URL**: https://www.ndotoni.com
   - **Use case description**: 
     ```
     Sending transactional emails for our rental property platform:
     - Email verification codes for new user signups
     - Password reset codes
     - Booking confirmations
     - Property inquiry notifications
     
     We expect to send approximately [X] emails per day.
     ```
   - **Compliance**: Confirm you have processes to handle bounces and complaints
6. Submit the request
7. AWS typically responds within 24 hours

## Check Current SES Status

Run this AWS CLI command to check if SES is in sandbox mode:

```bash
aws ses get-account-sending-enabled --region us-west-2
```

And check your sending quota:

```bash
aws sesv2 get-account --region us-west-2
```

Look for `ProductionAccessEnabled: false` - this means you're in sandbox mode.

## Alternative: Check Spam Folder

If your email is verified or SES is in production mode:
1. Check your spam/junk folder
2. Add info@ndotoni.com to your contacts
3. Check email filters/rules

## Verify SES Configuration

Check that SES is properly configured:

```bash
# List verified identities
aws ses list-identities --region us-west-2

# Check domain verification
aws ses get-identity-verification-attributes \
  --identities ndotoni.com \
  --region us-west-2
```

You should see:
- `info@ndotoni.com` or `ndotoni.com` as verified
- Verification status: `Success`

## Test Email Sending Manually

Test if SES can send emails:

```bash
aws ses send-email \
  --from info@ndotoni.com \
  --destination ToAddresses=your-email@example.com \
  --message Subject={Data="Test Email"},Body={Text={Data="This is a test"}} \
  --region us-west-2
```

If this fails, check:
- SES is in the correct region (us-west-2)
- info@ndotoni.com is verified
- Your AWS credentials have SES permissions

## Check CloudWatch Logs

Check if Cognito is actually calling SES:

1. Go to AWS Console → CloudWatch
2. Click "Log groups"
3. Look for `/aws/cognito/userpools/[your-pool-id]`
4. Check recent logs for email sending attempts
5. Look for errors related to SES

## Common Issues

### Issue: "Email address is not verified"
**Solution**: Verify the email address in SES (see Option 1 above)

### Issue: "Daily sending quota exceeded"
**Solution**: Request production access (see Option 2 above)

### Issue: "MessageRejected: Email address is not verified"
**Solution**: You're in sandbox mode. Verify the recipient email or request production access.

### Issue: Emails going to spam
**Solution**: 
- Set up SPF, DKIM, and DMARC records for ndotoni.com
- Request production access (improves deliverability)
- Use a consistent "from" address

## Temporary Workaround

While waiting for SES production access, you can:

1. Verify your test email addresses in SES
2. Use those verified emails for testing
3. Or manually verify users in Cognito:

```bash
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id us-west-2_0DZJBusjf \
  --username elm102@case.edu \
  --region us-west-2
```

## Summary

Most likely, you need to:
1. ✅ Verify your email address in SES (quick fix for testing)
2. ✅ Request SES production access (for production use)

The backend is working correctly - it's just SES sandbox restrictions preventing email delivery.
