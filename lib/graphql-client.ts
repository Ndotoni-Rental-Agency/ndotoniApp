/**
 * GraphQL Client for Mobile App
 * 
 * Provides a centralized way to execute GraphQL operations with:
 * - Automatic authentication handling
 * - Public (API Key) access
 * - Consistent error handling
 * - Type safety with generated types
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// GraphQL Configuration
const GRAPHQL_ENDPOINT = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT || 
  'https://pkqm7izcm5gm5hall3gc6o5dx4.appsync-api.us-west-2.amazonaws.com/graphql';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'da2-4kqoqw7d2jbndbilqiqpkypsve';

// Storage keys
const AUTH_TOKEN_KEY = '@ndotoni:authToken';
const USER_KEY = '@ndotoni:user';

/**
 * GraphQL Response type
 */
interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
}

/**
 * Authentication state
 */
interface AuthState {
  token?: string;
  user?: any;
}

/**
 * Get current authentication token
 */
async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('[GraphQLClient] Error getting auth token:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthToken();
  return !!token;
}

/**
 * Centralized GraphQL client for all API calls
 * 
 * Usage:
 * - Use `executeAuthenticated` for operations requiring user authentication
 * - Use `executePublic` for public/guest operations (uses API Key)
 * - Use `execute` for automatic auth mode selection
 */
export class GraphQLClient {
  /**
   * Execute a GraphQL query/mutation with automatic auth mode selection
   * Tries Cognito auth first, falls back to API Key if user not authenticated
   */
  static async execute<T = any>(
    query: string,
    variables?: Record<string, any>,
    forceApiKey = false
  ): Promise<T> {
    try {
      // Check if user is authenticated (unless forcing API key)
      const authenticated = !forceApiKey && await isAuthenticated();
      
      if (authenticated) {
        return await this.executeAuthenticated<T>(query, variables);
      } else {
        return await this.executePublic<T>(query, variables);
      }
    } catch (error) {
      console.error('[GraphQLClient] Execute error:', error);
      throw error;
    }
  }

  /**
   * Execute query with Cognito authentication (throws if not authenticated)
   * Use this for operations that REQUIRE user authentication
   */
  static async executeAuthenticated<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required for this operation');
    }

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          query,
          variables: variables || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        console.error('[GraphQLClient] GraphQL errors:', result.errors);
        throw new Error(error.message || 'GraphQL request failed');
      }

      if (!result.data) {
        throw new Error('No data returned from GraphQL request');
      }

      return result.data;
    } catch (error) {
      console.error('[GraphQLClient] Authenticated request error:', error);
      throw error;
    }
  }

  /**
   * Execute query with API Key (for public/guest access)
   * Use this for operations that should work without authentication
   */
  static async executePublic<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          query,
          variables: variables || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        console.error('[GraphQLClient] GraphQL errors:', result.errors);
        throw new Error(error.message || 'GraphQL request failed');
      }

      if (!result.data) {
        throw new Error('No data returned from GraphQL request');
      }

      return result.data;
    } catch (error) {
      console.error('[GraphQLClient] Public request error:', error);
      throw error;
    }
  }

  /**
   * Set authentication token (call after login)
   */
  static async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('[GraphQLClient] Error setting auth token:', error);
      throw error;
    }
  }

  /**
   * Clear authentication token (call on logout)
   */
  static async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('[GraphQLClient] Error clearing auth token:', error);
      throw error;
    }
  }

  /**
   * Get current authentication state
   */
  static async getAuthState(): Promise<AuthState> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userJson = await AsyncStorage.getItem(USER_KEY);
      const user = userJson ? JSON.parse(userJson) : null;
      
      return { token: token || undefined, user };
    } catch (error) {
      console.error('[GraphQLClient] Error getting auth state:', error);
      return {};
    }
  }

  /**
   * Check if user is currently authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    return await isAuthenticated();
  }
}

export default GraphQLClient;
