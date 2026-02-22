/**
 * Simple caching hook using AsyncStorage
 * For rarely changing data like property listings, categories, etc.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

interface CacheOptions {
  key: string;
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  fetchFn: () => Promise<any>;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export function useCache<T>({ key, ttl = DEFAULT_TTL, fetchFn }: CacheOptions) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [key]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get from cache first
      const cached = await getFromCache<T>(key);
      
      if (cached && !isCacheExpired(cached, ttl)) {
        setData(cached.data);
        setIsLoading(false);
        return;
      }

      // Cache miss or expired, fetch fresh data
      const freshData = await fetchFn();
      setData(freshData);
      
      // Save to cache
      await saveToCache(key, freshData);
    } catch (err) {
      console.error('[useCache] Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const freshData = await fetchFn();
      setData(freshData);
      
      await saveToCache(key, freshData);
    } catch (err) {
      console.error('[useCache] Error refreshing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem(key);
      setData(null);
    } catch (err) {
      console.error('[useCache] Error clearing cache:', err);
    }
  };

  return {
    data,
    isLoading,
    error,
    refresh,
    clearCache,
  };
}

// Helper functions
async function getFromCache<T>(key: string): Promise<CacheEntry<T> | null> {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;
    
    return JSON.parse(cached) as CacheEntry<T>;
  } catch (err) {
    console.error('[Cache] Error reading from cache:', err);
    return null;
  }
}

async function saveToCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch (err) {
    console.error('[Cache] Error saving to cache:', err);
  }
}

function isCacheExpired<T>(entry: CacheEntry<T>, ttl: number): boolean {
  return Date.now() - entry.timestamp > ttl;
}

// Utility function to clear all cache
export async function clearAllCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('@cache:'));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (err) {
    console.error('[Cache] Error clearing all cache:', err);
  }
}
