/**
 * OIDC User Manager for React Native
 * Handles OAuth/OIDC authentication flows with Cognito
 */

import { UserManager, User, UserManagerSettings } from 'oidc-client-ts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import oidcConfig, { getLogoutUrl } from './oidc-config';

// Ensure polyfills are loaded
import '../../polyfills';

// Custom storage adapter for React Native (AsyncStorage)
// Implements the minimal interface needed by oidc-client-ts
class AsyncStorageStore {
  private prefix: string;

  constructor(prefix: string = 'oidc.') {
    this.prefix = prefix;
  }

  async set(key: string, value: any): Promise<void> {
    await AsyncStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  async get(key: string): Promise<any> {
    const item = await AsyncStorage.getItem(this.prefix + key);
    return item ? JSON.parse(item) : null;
  }

  async remove(key: string): Promise<any> {
    const item = await this.get(key);
    await AsyncStorage.removeItem(this.prefix + key);
    return item;
  }

  async getAllKeys(): Promise<string[]> {
    const keys = await AsyncStorage.getAllKeys();
    return keys.filter(key => key.startsWith(this.prefix)).map(key => key.substring(this.prefix.length));
  }
}

// Create UserManager instance with React Native storage
const userManagerSettings: UserManagerSettings = {
  ...oidcConfig,
  userStore: new AsyncStorageStore('oidc.user.') as any,
  stateStore: new AsyncStorageStore('oidc.state.') as any,
};

export const userManager = new UserManager(userManagerSettings);

/**
 * Sign in with redirect (opens browser)
 */
export async function signInWithRedirect(): Promise<void> {
  try {
    // Generate state and store it
    const state = generateState();
    const stateStore = new AsyncStorageStore('oidc.state.');
    await stateStore.set(state, {
      created: Date.now(),
      request_type: 'signin'
    });
    
    // Build authorization URL manually using Cognito Domain (Hosted UI)
    const params = new URLSearchParams({
      client_id: oidcConfig.client_id,
      response_type: 'code',
      scope: oidcConfig.scope,
      redirect_uri: oidcConfig.redirect_uri,
      state
    });
    
    const authUrl = `${oidcConfig.cognitoDomain}/oauth2/authorize?${params.toString()}`;
    
    // Open browser with authorization URL
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      oidcConfig.redirect_uri
    );

    if (result.type === 'success' && result.url) {
      // Handle the callback URL
      await handleAuthCallback(result.url);
    } else if (result.type === 'cancel') {
      throw new Error('Authentication cancelled by user');
    }
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

/**
 * Exchange authorization code for tokens
 */
async function exchangeCodeForTokens(code: string): Promise<any> {
  const tokenEndpoint = oidcConfig.token_endpoint;
  
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: oidcConfig.client_id,
    code: code,
    redirect_uri: oidcConfig.redirect_uri
  });

  console.log('[OIDC] Exchanging code for tokens...');
  
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OIDC] Token exchange failed:', errorText);
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }

  const tokens = await response.json();
  console.log('[OIDC] Token exchange successful');
  return tokens;
}

/**
 * Decode JWT token (without verification - Cognito tokens are already verified)
 */
function decodeJwt(token: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT token');
  }
  
  const payload = parts[1];
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded);
}

/**
 * Handle OAuth callback URL
 */
export async function handleAuthCallback(url: string): Promise<User> {
  try {
    console.log('[OIDC] Handling callback URL:', url);
    
    // Parse the callback URL
    const urlObj = new URL(url);
    const code = urlObj.searchParams.get('code');
    const state = urlObj.searchParams.get('state');
    const error = urlObj.searchParams.get('error');
    
    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }
    
    if (!code) {
      throw new Error('No authorization code in callback URL');
    }
    
    // Verify state if present
    if (state) {
      const stateStore = new AsyncStorageStore('oidc.state.');
      const storedState = await stateStore.get(state);
      
      if (!storedState) {
        console.warn('[OIDC] State not found in storage, but continuing...');
      } else {
        console.log('[OIDC] State verified:', storedState);
        // Clean up the state
        await stateStore.remove(state);
      }
    }
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    
    // Decode ID token to get user profile
    const idTokenPayload = decodeJwt(tokens.id_token);
    
    // Create User object compatible with oidc-client-ts
    const user: User = {
      id_token: tokens.id_token,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type || 'Bearer',
      scope: tokens.scope || oidcConfig.scope,
      profile: {
        sub: idTokenPayload.sub,
        email: idTokenPayload.email,
        email_verified: idTokenPayload.email_verified,
        given_name: idTokenPayload.given_name,
        family_name: idTokenPayload.family_name,
        name: idTokenPayload.name,
        ...idTokenPayload
      },
      expires_at: idTokenPayload.exp,
      session_state: null,
      state: null,
      expired: false,
      scopes: (tokens.scope || oidcConfig.scope).split(' ')
    } as User;
    
    // Store the user in AsyncStorage with our simple key
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    
    console.log('[OIDC] Sign-in successful:', {
      email: user.profile.email,
      sub: user.profile.sub,
      expiresAt: user.expires_at
    });
    
    return user;
  } catch (error) {
    console.error('Callback handling error:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

/**
 * Sign out with redirect
 */
export async function signOutWithRedirect(): Promise<void> {
  try {
    // Get current user to include in logout request
    const user = await getCurrentUser();
    
    if (user) {
      // Open browser with logout URL
      await WebBrowser.openAuthSessionAsync(
        getLogoutUrl(),
        oidcConfig.logout_uri
      );
    }
    
    // Clear local user data
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Simple storage key for our custom user storage
const USER_STORAGE_KEY = 'oidc.current_user';

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Try to get from our custom storage first
    const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (userJson) {
      const user = JSON.parse(userJson) as User;
      console.log('[OIDC] getCurrentUser: Found user', {
        email: user.profile?.email,
        sub: user.profile?.sub,
        expired: user.expired,
        expiresAt: user.expires_at
      });
      return user;
    }
    
    console.log('[OIDC] getCurrentUser: No user found');
    return null;
  } catch (error) {
    console.error('[OIDC] Get user error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    console.log('[OIDC] isAuthenticated: No user');
    return false;
  }
  
  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  const isExpired = user.expires_at ? now >= user.expires_at : true;
  
  const isAuth = !isExpired;
  console.log('[OIDC] isAuthenticated:', isAuth, {
    now,
    expiresAt: user.expires_at,
    isExpired
  });
  return isAuth;
}

/**
 * Get access token
 */
export async function getAccessToken(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.access_token || null;
}

/**
 * Get ID token
 */
export async function getIdToken(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id_token || null;
}

/**
 * Refresh tokens
 */
export async function refreshTokens(): Promise<User | null> {
  try {
    const user = await userManager.signinSilent();
    return user;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

/**
 * Generate a random state parameter for OAuth
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Build authorization URL manually
 */
function buildAuthUrl(identityProvider: string, additionalParams: Record<string, string> = {}): string {
  const params = new URLSearchParams({
    client_id: oidcConfig.client_id,
    response_type: 'code',
    scope: oidcConfig.scope,
    redirect_uri: oidcConfig.redirect_uri,
    identity_provider: identityProvider,
    ...additionalParams
  });
  
  // Use cognitoDomain (Hosted UI) instead of authority (IDP endpoint)
  return `${oidcConfig.cognitoDomain}/oauth2/authorize?${params.toString()}`;
}

/**
 * Sign in with Google (via Cognito Hosted UI)
 */
export async function signInWithGoogle(): Promise<void> {
  try {
    // Generate state and store it
    const state = generateState();
    const stateStore = new AsyncStorageStore('oidc.state.');
    await stateStore.set(state, {
      created: Date.now(),
      request_type: 'signin:Google'
    });
    
    // Build authorization URL manually
    const authUrl = buildAuthUrl('Google', {
      state,
      prompt: 'select_account'
    });
    
    console.log('[OIDC] Opening Google sign-in:', authUrl);
    
    // Open browser with the authorization URL
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      oidcConfig.redirect_uri
    );

    console.log('[OIDC] Browser result:', result);

    if (result.type === 'success' && result.url) {
      console.log('[OIDC] Processing callback URL:', result.url);
      await handleAuthCallback(result.url);
    } else if (result.type === 'cancel') {
      throw new Error('Google sign-in cancelled');
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

/**
 * Sign in with Facebook (via Cognito Hosted UI)
 */
export async function signInWithFacebook(): Promise<void> {
  try {
    // Generate state and store it
    const state = generateState();
    const stateStore = new AsyncStorageStore('oidc.state.');
    await stateStore.set(state, {
      created: Date.now(),
      request_type: 'signin:Facebook'
    });
    
    // Build authorization URL manually
    const authUrl = buildAuthUrl('Facebook', { state });
    
    console.log('[OIDC] Opening Facebook sign-in:', authUrl);
    
    // Open browser with the authorization URL
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      oidcConfig.redirect_uri
    );

    if (result.type === 'success' && result.url) {
      await handleAuthCallback(result.url);
    } else if (result.type === 'cancel') {
      throw new Error('Facebook sign-in cancelled');
    }
  } catch (error) {
    console.error('Facebook sign-in error:', error);
    throw error;
  }
}

// Set up deep linking listener for OAuth callbacks
export function setupDeepLinking(onAuthCallback: (url: string) => void) {
  // Handle initial URL (app opened from deep link)
  Linking.getInitialURL().then(url => {
    if (url && url.includes('code=')) {
      onAuthCallback(url);
    }
  });

  // Handle subsequent deep links (app already open)
  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (url && url.includes('code=')) {
      onAuthCallback(url);
    }
  });

  return () => subscription.remove();
}

export default userManager;
