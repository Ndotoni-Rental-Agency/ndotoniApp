/**
 * Hybrid Auth Service
 * Combines Amplify Auth (for email/password) with OIDC (for social auth)
 */

import { 
  signUp as amplifySignUp,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendCode,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  getCurrentUser as amplifyGetCurrentUser,
  fetchAuthSession as amplifyFetchAuthSession
} from 'aws-amplify/auth';

import {
  signInWithGoogle as oidcSignInWithGoogle,
  signInWithFacebook as oidcSignInWithFacebook,
  signOutWithRedirect as oidcSignOut,
  getCurrentUser as oidcGetCurrentUser,
  isAuthenticated as oidcIsAuthenticated,
  getAccessToken as oidcGetAccessToken,
  getIdToken as oidcGetIdToken
} from './oidc-manager';

export type AuthMethod = 'amplify' | 'oidc';

/**
 * Hybrid Auth Service
 * Provides unified interface for both Amplify and OIDC auth
 */
export class HybridAuthService {
  private static currentAuthMethod: AuthMethod = 'amplify';

  /**
   * Sign up with email/password (Amplify)
   */
  static async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string
  ) {
    this.currentAuthMethod = 'amplify';
    
    return await amplifySignUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          given_name: firstName,
          family_name: lastName,
          ...(phoneNumber && { phone_number: phoneNumber })
        }
      }
    });
  }

  /**
   * Confirm sign up (Amplify)
   */
  static async confirmSignUp(email: string, code: string) {
    return await amplifyConfirmSignUp({
      username: email,
      confirmationCode: code
    });
  }

  /**
   * Resend verification code (Amplify)
   */
  static async resendCode(email: string) {
    return await amplifyResendCode({
      username: email
    });
  }

  /**
   * Sign in with email/password (Amplify)
   */
  static async signIn(email: string, password: string) {
    this.currentAuthMethod = 'amplify';
    
    return await amplifySignIn({
      username: email,
      password
    });
  }

  /**
   * Sign in with Google (OIDC)
   */
  static async signInWithGoogle() {
    this.currentAuthMethod = 'oidc';
    await oidcSignInWithGoogle();
  }

  /**
   * Sign in with Facebook (OIDC)
   */
  static async signInWithFacebook() {
    this.currentAuthMethod = 'oidc';
    await oidcSignInWithFacebook();
  }

  /**
   * Sign out (handles both Amplify and OIDC)
   */
  static async signOut() {
    try {
      // Try OIDC sign out first
      const oidcUser = await oidcGetCurrentUser();
      if (oidcUser) {
        await oidcSignOut();
      }
    } catch (error) {
      console.log('No OIDC session to sign out');
    }

    try {
      // Try Amplify sign out
      await amplifySignOut();
    } catch (error) {
      console.log('No Amplify session to sign out');
    }

    this.currentAuthMethod = 'amplify';
  }

  /**
   * Check if authenticated (checks both methods)
   */
  static async isAuthenticated(): Promise<boolean> {
    // Check OIDC first
    const oidcAuth = await oidcIsAuthenticated();
    if (oidcAuth) {
      this.currentAuthMethod = 'oidc';
      return true;
    }

    // Check Amplify
    try {
      await amplifyGetCurrentUser();
      this.currentAuthMethod = 'amplify';
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get access token (from current auth method)
   */
  static async getAccessToken(): Promise<string | undefined> {
    // Try OIDC first
    const oidcToken = await oidcGetAccessToken();
    if (oidcToken) {
      return oidcToken;
    }

    // Try Amplify
    try {
      const session = await amplifyFetchAuthSession();
      return session.tokens?.accessToken?.toString();
    } catch {
      return undefined;
    }
  }

  /**
   * Get ID token (from current auth method)
   */
  static async getIdToken(): Promise<string | undefined> {
    // Try OIDC first
    const oidcToken = await oidcGetIdToken();
    if (oidcToken) {
      return oidcToken;
    }

    // Try Amplify
    try {
      const session = await amplifyFetchAuthSession();
      return session.tokens?.idToken?.toString();
    } catch {
      return undefined;
    }
  }

  /**
   * Forgot password (Amplify)
   */
  static async forgotPassword(email: string) {
    return await amplifyResetPassword({
      username: email
    });
  }

  /**
   * Confirm forgot password (Amplify)
   */
  static async confirmForgotPassword(
    email: string,
    code: string,
    newPassword: string
  ) {
    return await amplifyConfirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword
    });
  }

  /**
   * Get current auth method
   */
  static getCurrentAuthMethod(): AuthMethod {
    return this.currentAuthMethod;
  }
}

export default HybridAuthService;
