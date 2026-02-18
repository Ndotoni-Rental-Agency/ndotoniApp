/**
 * Authentication Bridge for Mobile App
 * Mixed approach: Custom signUp + Amplify signIn
 */

import { GraphQLClient } from './graphql-client';
import { 
  signIn as cognitoSignIn, 
  signOut as cognitoSignOut, 
  getCurrentUser,
  signInWithRedirect 
} from 'aws-amplify/auth';
import { getMe } from './graphql/queries';
import { signUp as signUpMutation } from './graphql/mutations';

export class AuthBridge {
  /**
   * Sign up using custom GraphQL mutation (creates user in both systems)
   */
  static async signUpWithCustom(input: any) {
    try {
      // Use custom GraphQL mutation for sign up
      const data = await GraphQLClient.executePublic<{ signUp: any }>(
        signUpMutation,
        { input }
      );

      if (!data.signUp) {
        throw new Error('Invalid response from server');
      }

      return data.signUp;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sign in using Amplify Cognito, then fetch user profile from custom backend
   */
  static async signInWithAmplify(email: string, password: string) {
    try {
      // Step 1: Authenticate with Cognito (primary authentication)
      const signInResult = await cognitoSignIn({
        username: email,
        password,
      });

      // Handle cases where sign-in is not complete
      if (!signInResult.isSignedIn) {
        const nextStep = signInResult.nextStep;
        
        // Create an error with the nextStep information
        const error: any = new Error(
          nextStep?.signInStep 
            ? `Sign in requires additional step: ${nextStep.signInStep}`
            : 'Sign in was not successful. Please check your credentials.'
        );
        
        // Set error name based on the next step
        if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
          error.name = 'UserNotConfirmedException';
          error.message = 'User is not confirmed. Please verify your email.';
        } else if (nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
          error.name = 'NewPasswordRequiredException';
        } else if (nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_SMS_CODE') {
          error.name = 'SMSMFARequiredException';
        } else if (nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_TOTP_CODE') {
          error.name = 'TOTPMFARequiredException';
        } else {
          error.name = 'SignInIncompleteException';
        }
        
        // Attach the full nextStep for debugging
        error.nextStep = nextStep;
        
        throw error;
      }

      // Step 2: Get user profile from your custom backend using Cognito auth
      const data = await GraphQLClient.executeAuthenticated<{ getMe: any }>(
        getMe
      );

      if (!data.getMe) {
        throw new Error('User profile not found');
      }

      // Return user data in the expected format
      return {
        accessToken: 'COGNITO_MANAGED', // Cognito manages tokens
        refreshToken: 'COGNITO_MANAGED', // Cognito manages tokens
        user: data.getMe
      };
    } catch (error: any) {
      // Re-throw the error with its original structure so it can be properly detected
      throw error;
    }
  }

  /**
   * Sign out from Cognito
   */
  static async signOutFromBridge() {
    try {
      await cognitoSignOut();
    } catch (error) {
      // Silent fail
      console.log('[AuthBridge] Sign out error:', error);
    }
  }

  /**
   * Sign out with redirect to Cognito Hosted UI
   * This also signs the user out from the identity provider (Google/Facebook)
   */
  static async signOutWithHostedUI() {
    try {
      await cognitoSignOut({ global: true });
    } catch (error) {
      // Silent fail
      console.log('[AuthBridge] Sign out with hosted UI error:', error);
    }
  }

  /**
   * Check if user has valid Cognito session
   */
  static async hasCognitoSession(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get auth mode based on authentication state
   */
  static async getAuthMode(): Promise<'userPool' | 'apiKey'> {
    try {
      await getCurrentUser();
      return 'userPool'; // User is authenticated with Cognito
    } catch {
      return 'apiKey'; // Guest mode - use API Key
    }
  }

  /**
   * Get current user from Cognito
   */
  static async getCurrentCognitoUser() {
    try {
      return await getCurrentUser();
    } catch (error) {
      throw new Error('No authenticated user');
    }
  }

  /**
   * Sign in with Google using Cognito Hosted UI
   */
  static async signInWithGoogle() {
    try {
      await signInWithRedirect({ provider: 'Google' });
      // This will redirect the user to Google OAuth, so no return value
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sign in with Facebook using Cognito Hosted UI
   */
  static async signInWithFacebook() {
    try {
      await signInWithRedirect({ provider: 'Facebook' });
      // This will redirect the user to Facebook OAuth, so no return value
    } catch (error) {
      throw error;
    }
  }
}
