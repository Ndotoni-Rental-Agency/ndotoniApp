/**
 * GraphQL Caching Layer for React Native
 * Provides intelligent caching for GraphQL queries to improve performance
 */

import { GraphQLClient } from '@/lib/graphql-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from 'aws-amplify/auth';

const STORAGE_PREFIX = 'graphql_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

interface GraphQLCacheEntry {
  data: any;
  timestamp: number;
  query: string;
  variables: any;
  authMode: 'userPool' | 'apiKey';
}

interface CacheMetrics {
  hits: number;
  misses: number;
}

// In-memory cache
const graphqlCache = new Map<string, GraphQLCacheEntry>();

// Cache performance tracking
const cacheMetrics: CacheMetrics = {
  hits: 0,
  misses: 0
};

/**
 * Generate cache key from query and variables
 */
function generateCacheKey(query: string, variables: any, authMode: string): string {
  const queryName = extractQueryName(query);
  const sortedVars = JSON.stringify(variables, Object.keys(variables || {}).sort());
  return `${queryName}:${authMode}:${sortedVars}`;
}

/**
 * Extract query name from GraphQL query string
 */
function extractQueryName(query: string): string {
  const match = query.match(/(?:query|mutation)\s+(\w+)/);
  return match ? match[1] : 'unknown';
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: GraphQLCacheEntry): boolean {
  const age = Date.now() - entry.timestamp;
  return age < DEFAULT_TTL;
}

/**
 * Get authentication mode
 */
async function getAuthMode(forceApiKey: boolean): Promise<'userPool' | 'apiKey'> {
  if (forceApiKey) {
    return 'apiKey';
  }
  
  try {
    await getCurrentUser();
    return 'userPool';
  } catch {
    return 'apiKey';
  }
}

/**
 * Save cache entry to AsyncStorage
 */
async function saveToStorage(key: string, entry: GraphQLCacheEntry): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${STORAGE_PREFIX}${key}`,
      JSON.stringify(entry)
    );
  } catch (error) {
    console.warn('[cache] Failed to save to AsyncStorage:', error);
  }
}

/**
 * Load cache entry from AsyncStorage
 */
async function loadFromStorage(key: string): Promise<GraphQLCacheEntry | null> {
  try {
    const data = await AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('[cache] Failed to load from AsyncStorage:', error);
  }
  return null;
}

/**
 * Remove cache entry from AsyncStorage
 */
async function removeFromStorage(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.warn('[cache] Failed to remove from AsyncStorage:', error);
  }
}

// Cached GraphQL client wrapper
export const cachedGraphQL = {
  /**
   * Execute GraphQL query with intelligent caching
   */
  async query<T = any>(options: {
    query: string;
    variables?: any;
    forceRefresh?: boolean;
    forceApiKey?: boolean;
  }): Promise<{ data: T }> {
    const { query, variables = {}, forceRefresh = false, forceApiKey = false } = options;
    const authMode = await getAuthMode(forceApiKey);
    const cacheKey = generateCacheKey(query, variables, authMode);

    // Check in-memory cache first
    if (!forceRefresh) {
      const cached = graphqlCache.get(cacheKey);
      if (cached && isCacheValid(cached)) {
        cacheMetrics.hits++;
        return { data: cached.data };
      }

      // Check AsyncStorage if not in memory
      const storedCache = await loadFromStorage(cacheKey);
      if (storedCache && isCacheValid(storedCache)) {
        graphqlCache.set(cacheKey, storedCache);
        cacheMetrics.hits++;
        return { data: storedCache.data };
      }
    }

    // Cache miss - fetch fresh data
    try {
      let data;
      if (authMode === 'userPool') {
        data = await GraphQLClient.executeAuthenticated(query, variables);
      } else {
        data = await GraphQLClient.executePublic(query, variables);
      }

      cacheMetrics.misses++;

      // Store in cache
      const cacheEntry: GraphQLCacheEntry = {
        data,
        timestamp: Date.now(),
        query,
        variables,
        authMode
      };

      graphqlCache.set(cacheKey, cacheEntry);
      saveToStorage(cacheKey, cacheEntry); // Fire and forget

      return { data };
    } catch (error) {
      console.error('[cache] GraphQL Query Error:', error);
      
      // Try to return expired cached data as fallback
      const cached = graphqlCache.get(cacheKey);
      if (cached) {
        console.warn('[cache] Returning expired cached data as fallback');
        return { data: cached.data };
      }
      
      throw error;
    }
  },

  /**
   * Execute GraphQL mutation (never cached)
   */
  async mutate<T = any>(options: {
    query: string;
    variables?: any;
    forceApiKey?: boolean;
  }): Promise<{ data: T }> {
    const { query, variables = {}, forceApiKey = false } = options;
    const authMode = await getAuthMode(forceApiKey);

    try {
      let data;
      if (authMode === 'userPool') {
        data = await GraphQLClient.executeAuthenticated(query, variables);
      } else {
        data = await GraphQLClient.executePublic(query, variables);
      }

      return { data };
    } catch (error) {
      console.error('[cache] GraphQL Mutation Error:', error);
      throw error;
    }
  },

  /**
   * Execute query with Cognito authentication
   */
  async queryAuthenticated<T = any>(options: {
    query: string;
    variables?: any;
    forceRefresh?: boolean;
  }): Promise<{ data: T }> {
    try {
      await getCurrentUser();
      return await this.query({
        ...options,
        forceApiKey: false
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'UserUnAuthenticatedError') {
        throw new Error('Authentication required for this operation');
      }
      throw error;
    }
  },

  /**
   * Execute query with API Key (public access)
   */
  async queryPublic<T = any>(options: {
    query: string;
    variables?: any;
    forceRefresh?: boolean;
  }): Promise<{ data: T }> {
    return await this.query({
      ...options,
      forceApiKey: true
    });
  },

  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    graphqlCache.clear();
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('[cache] Failed to clear AsyncStorage:', error);
    }
  },

  /**
   * Clear specific query caches
   */
  async clearQuery(queryName: string): Promise<void> {
    for (const [key, entry] of Array.from(graphqlCache.entries())) {
      if (extractQueryName(entry.query) === queryName) {
        graphqlCache.delete(key);
        await removeFromStorage(key);
      }
    }
  },

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = cacheMetrics.hits + cacheMetrics.misses > 0
      ? ((cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses)) * 100).toFixed(1)
      : '0';

    return {
      totalEntries: graphqlCache.size,
      performance: {
        hits: cacheMetrics.hits,
        misses: cacheMetrics.misses,
        hitRate: `${hitRate}%`
      }
    };
  }
};
