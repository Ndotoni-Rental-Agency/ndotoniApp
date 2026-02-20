/**
 * GraphQL Client for Mobile App
 * 
 * Provides a centralized way to execute GraphQL operations with:
 * - Automatic authentication handling (Amplify + OIDC)
 * - Public (API Key) access
 * - Consistent error handling
 * - Type safety with generated types
 */

import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import HybridAuthService from './auth/hybrid-auth-service';

// Ensure Amplify is configured
import './amplify';

// Get AppSync configuration
const GRAPHQL_ENDPOINT = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT || 'https://pkqm7izcm5gm5hall3gc6o5dx4.appsync-api.us-west-2.amazonaws.com/graphql';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'da2-4kqoqw7d2jbndbilqiqpkypsve';

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
 * Check if user is authenticated (checks both Amplify and OIDC)
 */
async function isAuthenticated(): Promise<boolean> {
  return await HybridAuthService.isAuthenticated();
}

/**
 * Get access token from current auth method (Amplify or OIDC)
 */
async function getAccessToken(): Promise<string | undefined> {
  return await HybridAuthService.getAccessToken();
}

/**
 * Execute GraphQL request with custom fetch (supports both Amplify and OIDC tokens)
 */
async function executeGraphQLRequest<T>(
  query: string,
  variables: Record<string, any> | undefined,
  authMode: 'userPool' | 'apiKey'
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authMode === 'apiKey') {
    headers['x-api-key'] = API_KEY;
  } else {
    // Get token from hybrid auth service (works for both Amplify and OIDC)
    const token = await getAccessToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    headers['Authorization'] = token;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables: variables || {},
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors && result.errors.length > 0) {
    const error = result.errors[0];
    console.error('[GraphQLClient] GraphQL errors:', result.errors);
    throw new Error(error.message || 'GraphQL request failed');
  }

  return result.data as T;
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
   * Tries Cognito auth first (Amplify or OIDC), falls back to API Key if user not authenticated
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
        const isAuth = await HybridAuthService.isAuthenticated();
        if (isAuth) {
          authMode = 'userPool'; // User is authenticated (Amplify or OIDC)
        }
      }

      // Use custom fetch to support both Amplify and OIDC tokens
      return await executeGraphQLRequest<T>(query, variables, authMode);
    } catch (error) {
      console.error('[GraphQLClient] Execute error:', error);
      throw error;
    }
  }

  /**
   * Execute query with Cognito authentication (throws if not authenticated)
   * Use this for operations that REQUIRE user authentication
   * Works with both Amplify Auth and OIDC tokens
   */
  static async executeAuthenticated<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    try {
      // Check if user is authenticated (checks both Amplify and OIDC)
      const isAuth = await HybridAuthService.isAuthenticated();
      if (!isAuth) {
        throw new Error('User not authenticated');
      }

      // Get access token from current auth method
      const accessToken = await HybridAuthService.getAccessToken();
      if (!accessToken) {
        throw new Error('No valid authentication token');
      }

      // Determine auth method for logging
      const authMethod = HybridAuthService.getCurrentAuthMethod();
      console.log('[GraphQLClient] Authenticated request:', { 
        authMethod,
        hasAccessToken: !!accessToken,
        tokenPreview: accessToken.substring(0, 20) + '...'
      });
      
      // Use custom fetch to support both Amplify and OIDC tokens
      return await executeGraphQLRequest<T>(query, variables, 'userPool');
    } catch (error) {
      console.error('[GraphQLClient] Authenticated request error:', error);
      // If it's an auth error, provide more context
      if (error instanceof Error && 
          (error.message.includes('Unauthorized') || 
           error.message.includes('No valid authentication') ||
           error.message.includes('User not authenticated'))) {
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
      return await executeGraphQLRequest<T>(query, variables, 'apiKey');
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
