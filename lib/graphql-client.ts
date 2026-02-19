/**
 * GraphQL Client for Mobile App
 * 
 * Provides a centralized way to execute GraphQL operations with:
 * - Automatic authentication handling via AWS Amplify
 * - Public (API Key) access
 * - Consistent error handling
 * - Type safety with generated types
 */

import { fetchAuthSession } from 'aws-amplify/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// GraphQL Configuration
const GRAPHQL_ENDPOINT = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT || 
  'https://pkqm7izcm5gm5hall3gc6o5dx4.appsync-api.us-west-2.amazonaws.com/graphql';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'da2-4kqoqw7d2jbndbilqiqpkypsve';

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
 * Get current auth token from Amplify or AsyncStorage (for OAuth)
 */
async function getAuthToken(): Promise<string | null> {
  try {
    // First try to get token from Amplify session
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      return token;
    }
  } catch (error) {
    console.log('[GraphQLClient] No Amplify session:', error);
  }
  
  // Fallback to OAuth token stored in AsyncStorage
  try {
    const oauthToken = await AsyncStorage.getItem('@ndotoni:oauth_id_token');
    if (oauthToken) {
      console.log('[GraphQLClient] Using OAuth token from AsyncStorage');
      return oauthToken;
    }
  } catch (error) {
    console.log('[GraphQLClient] No OAuth token in AsyncStorage:', error);
  }
  
  return null;
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
        const errorText = await response.text();
        console.error('[GraphQLClient] HTTP error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        console.error('[GraphQLClient] GraphQL error:', error.message);
        throw new Error(error.message || 'GraphQL request failed');
      }

      if (!result.data) {
        console.error('[GraphQLClient] No data in response');
        throw new Error('No data returned from GraphQL request');
      }

      return result.data;
    } catch (error) {
      console.error('[GraphQLClient] Public request error:', (error as any)?.message || 'Unknown');
      throw error;
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
