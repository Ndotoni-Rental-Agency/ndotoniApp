/**
 * GraphQL Client for Mobile App
 * 
 * Provides a centralized way to execute GraphQL operations with:
 * - Automatic authentication handling via AWS Amplify
 * - Public (API Key) access
 * - Consistent error handling
 * - Type safety with generated types
 */

import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

// Ensure Amplify is configured
import './amplify';

// Initialize Amplify client
const amplifyClient = generateClient();

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
 * Check if user is authenticated
 */
async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
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
      let authMode: 'userPool' | 'apiKey' = 'apiKey';
      
      if (!forceApiKey) {
        try {
          await getCurrentUser();
          authMode = 'userPool'; // User is authenticated, use Cognito
        } catch {
          authMode = 'apiKey'; // User not authenticated, use API key
        }
      }

      const result = await amplifyClient.graphql({
        query,
        variables,
        authMode,
      }) as any;

      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        console.error('[GraphQLClient] GraphQL errors:', result.errors);
        throw new Error(error.message || 'GraphQL request failed');
      }

      return result.data as T;
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
    try {
      // Verify user is authenticated and get user details for debugging
      const user = await getCurrentUser();
      
      // Also verify we have valid tokens
      const session = await fetchAuthSession();
      if (!session.tokens?.accessToken) {
        console.error('[GraphQLClient] No access token in session');
        throw new Error('No valid authentication token');
      }
      
      console.log('[GraphQLClient] Authenticated request:', { 
        userId: user.userId, 
        username: user.username,
        hasAccessToken: !!session.tokens.accessToken,
        hasIdToken: !!session.tokens.idToken
      });
      
      const result = await amplifyClient.graphql({
        query,
        variables,
        authMode: 'userPool',
      }) as any;

      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        console.error('[GraphQLClient] GraphQL errors:', result.errors);
        console.error('[GraphQLClient] Request details:', { 
          query: query.substring(0, 100), 
          variables,
          userId: user.userId 
        });
        throw new Error(error.message || 'GraphQL request failed');
      }

      if (!result.data) {
        throw new Error('No data returned from GraphQL request');
      }

      return result.data as T;
    } catch (error) {
      console.error('[GraphQLClient] Authenticated request error:', error);
      // If it's an auth error, provide more context
      if (error instanceof Error && 
          (error.message.includes('Unauthorized') || 
           error.message.includes('No valid authentication'))) {
        console.error('[GraphQLClient] Authentication failed - user may need to sign in again');
      }
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
      const result = await amplifyClient.graphql({
        query,
        variables,
        authMode: 'apiKey',
      }) as any;

      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        console.error('[GraphQLClient] GraphQL error:', error.message);
        throw new Error(error.message || 'GraphQL request failed');
      }

      if (!result.data) {
        console.error('[GraphQLClient] No data in response');
        throw new Error('No data returned from GraphQL request');
      }

      return result.data as T;
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
