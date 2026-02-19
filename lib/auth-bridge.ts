/**
 * Authentication Bridge for Mobile App
 * Mixed approach: Custom signUp + Amplify signIn
 */

import { GraphQLClient } from './graphql-client';
import { 
  signIn as cognitoSignIn, 
  signOut as cognitoSignOut, 
  getCurrentUser,
  fetchAuthSession
} from 'aws-amplify/auth';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe } from './graphql/queries';
import { signUp as signUpMutation } from './graphql/mutations';
import { amplifyConfig } from './config';

// Complete the web browser session on return
WebBrowser.maybeCompleteAuthSession();

export class AuthBridge {
  /**
   * Sign up using custom GraphQL mutation (creates user in both systems)
   */
  static async signUpWithCustom(input: any) {
    try {
      console.log('[AuthBridge] signUpWithCustom called');
      
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
      console.error('[AuthBridge] signUpWithCustom error:', (error as any)?.message || 'Unknown');
      throw error;
    }
  }

  /**
   * Sign in using Amplify Cognito, then fetch user profile from custom backend
   * Uses USER_PASSWORD_AUTH instead of SRP to avoid native module requirements
   */
  static async signInWithAmplify(email: string, password: string) {
    try {
      console.log('[AuthBridge] Starting Cognito sign in for:', email);
      console.log('[AuthBridge] Using USER_PASSWORD_AUTH (no native modules required)');
      
      // Step 1: Authenticate with Cognito using USER_PASSWORD_AUTH
      // This avoids the SRP flow which requires native modules
      const signInResult = await cognitoSignIn({
        username: email,
        password,
        options: {
          authFlowType: 'USER_PASSWORD_AUTH'
        }
      });

      console.log('[AuthBridge] Cognito sign in result:', {
        isSignedIn: signInResult.isSignedIn,
        nextStep: signInResult.nextStep,
      });

      // Handle cases where sign-in is not complete
      if (!signInResult.isSignedIn) {
        const nextStep = signInResult.nextStep;
        
        console.log('[AuthBridge] Sign in not complete, nextStep:', nextStep);
        
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

      console.log('[AuthBridge] Cognito sign in successful, fetching user profile');

      // Step 2: Get user profile from your custom backend using Cognito auth
      const data = await GraphQLClient.executeAuthenticated<{ getMe: any }>(
        getMe
      );

      if (!data.getMe) {
        throw new Error('User profile not found');
      }

      console.log('[AuthBridge] User profile fetched successfully');

      // Return user data in the expected format
      return {
        accessToken: 'COGNITO_MANAGED', // Cognito manages tokens
        refreshToken: 'COGNITO_MANAGED', // Cognito manages tokens
        user: data.getMe
      };
    } catch (error: any) {
      console.error('[AuthBridge] signInWithAmplify error:', error?.name || 'Unknown');
      
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
      
      // Clear OAuth tokens from AsyncStorage
      await AsyncStorage.removeItem('@ndotoni:oauth_id_token');
      await AsyncStorage.removeItem('@ndotoni:oauth_access_token');
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
   * Sign in with Google using Cognito Hosted UI via Expo WebBrowser
   * Uses manual token handling since Amplify's signInWithRedirect doesn't work well in React Native
   */
  static async signInWithGoogle() {
    try {
      const cognitoConfig = amplifyConfig.Auth.Cognito;
      const domain = cognitoConfig.loginWith.oauth.domain;
      const clientId = cognitoConfig.userPoolClientId;
      const redirectUri = cognitoConfig.loginWith.oauth.redirectSignIn[0];
      const scopes = cognitoConfig.loginWith.oauth.scopes.join(' ');

      // Build the OAuth URL with implicit flow (token response)
      // prompt=select_account forces Google to show account picker every time
      const authUrl = `https://${domain}/oauth2/authorize?` +
        `identity_provider=Google&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `client_id=${clientId}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `prompt=select_account`;

      console.log('[AuthBridge] Opening OAuth URL:', authUrl);

      // Open the browser for OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );

      console.log('[AuthBridge] OAuth result:', result);

      if (result.type === 'success' && result.url) {
        // Parse tokens from URL fragment
        const url = result.url;
        const fragment = url.split('#')[1];
        
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const idToken = params.get('id_token');
          
          if (accessToken && idToken) {
            console.log('[AuthBridge] Got tokens from OAuth redirect');
            console.log('[AuthBridge] Access token:', accessToken.substring(0, 50) + '...');
            console.log('[AuthBridge] ID token:', idToken.substring(0, 50) + '...');
            
            // Store tokens in AsyncStorage for later use
            await AsyncStorage.setItem('@ndotoni:oauth_id_token', idToken);
            await AsyncStorage.setItem('@ndotoni:oauth_access_token', accessToken);
            console.log('[AuthBridge] Stored OAuth tokens in AsyncStorage');
            
            // Use the tokens directly to fetch user profile
            // We'll pass the token directly to the GraphQL client
            const data = await this.fetchUserProfileWithToken(idToken);

            if (!data.getMe) {
              throw new Error('User profile not found');
            }

            return {
              accessToken: 'COGNITO_MANAGED',
              refreshToken: 'COGNITO_MANAGED',
              user: data.getMe
            };
          }
        }
      }
      
      throw new Error('OAuth sign in was cancelled or failed');
    } catch (error) {
      console.error('[AuthBridge] OAuth error:', error);
      throw error;
    }
  }

  /**
   * Fetch user profile using a specific token (for OAuth flows)
   */
  private static async fetchUserProfileWithToken(token: string): Promise<{ getMe: any }> {
    const GRAPHQL_ENDPOINT = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT || 
      'https://pkqm7izcm5gm5hall3gc6o5dx4.appsync-api.us-west-2.amazonaws.com/graphql';

    try {
      console.log('[AuthBridge] Fetching user profile with OAuth token');
      
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          query: getMe,
          variables: {},
        }),
      });

      console.log('[AuthBridge] Profile fetch response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AuthBridge] Profile fetch failed:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[AuthBridge] Profile fetch result:', result);

      if (result.errors && result.errors.length > 0) {
        console.error('[AuthBridge] GraphQL errors:', result.errors);
        throw new Error(result.errors[0].message || 'Failed to fetch user profile');
      }

      return result.data;
    } catch (error) {
      console.error('[AuthBridge] fetchUserProfileWithToken error:', error);
      throw error;
    }
  }

  /**
   * Sign in with Facebook using Cognito Hosted UI via Expo WebBrowser
   */
  static async signInWithFacebook() {
    try {
      const cognitoConfig = amplifyConfig.Auth.Cognito;
      const domain = cognitoConfig.loginWith.oauth.domain;
      const clientId = cognitoConfig.userPoolClientId;
      const redirectUri = cognitoConfig.loginWith.oauth.redirectSignIn[0];
      const scopes = cognitoConfig.loginWith.oauth.scopes.join(' ');

      // Build the OAuth URL with implicit flow (token response)
      // prompt=select_account forces account picker (though Facebook handles this differently)
      const authUrl = `https://${domain}/oauth2/authorize?` +
        `identity_provider=Facebook&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `client_id=${clientId}&` +
        `scope=${encodeURIComponent(scopes)}&` +
        `prompt=select_account`;

      // Open the browser for OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );

      if (result.type === 'success' && result.url) {
        // Parse tokens from URL fragment
        const url = result.url;
        const fragment = url.split('#')[1];
        
        if (fragment) {
          const params = new URLSearchParams(fragment);
          const accessToken = params.get('access_token');
          const idToken = params.get('id_token');
          
          if (accessToken && idToken) {
            // Wait a moment for tokens to be available
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Fetch user profile
            const data = await GraphQLClient.executeAuthenticated<{ getMe: any }>(
              getMe
            );

            if (!data.getMe) {
              throw new Error('User profile not found');
            }

            return {
              accessToken: 'COGNITO_MANAGED',
              refreshToken: 'COGNITO_MANAGED',
              user: data.getMe
            };
          }
        }
      }
      
      throw new Error('OAuth sign in was cancelled or failed');
    } catch (error) {
      throw error;
    }
  }
}
